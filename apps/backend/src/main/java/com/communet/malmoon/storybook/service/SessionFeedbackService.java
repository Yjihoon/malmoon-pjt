package com.communet.malmoon.storybook.service;

import com.communet.malmoon.storybook.domain.SpeechResult;
import com.communet.malmoon.storybook.dto.FeedbackEvalRequestDto;
import com.communet.malmoon.storybook.dto.FeedbackEvalResponseDto;
import com.communet.malmoon.storybook.dto.SessionFeedbackRequestDto;
import com.communet.malmoon.storybook.domain.SessionFeedback;
import com.communet.malmoon.storybook.repository.SpeechResultRepository;
import com.communet.malmoon.storybook.repository.SessionFeedbackRepository;
import com.communet.malmoon.member.domain.Member;
import com.communet.malmoon.storybook.domain.Storybook;
import com.communet.malmoon.member.repository.MemberRepository;
import com.communet.malmoon.storybook.repository.StorybookRepository;
import lombok.RequiredArgsConstructor;
import lombok.Data;

import org.springframework.stereotype.Service;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SessionFeedbackService {

    private final SpeechResultRepository speechResultRepository;
    private final SessionFeedbackRepository sessionFeedbackRepository;
    private final MemberRepository memberRepository;
    private final StorybookRepository storybookRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    public void processFeedbackAfterLesson(SessionFeedbackRequestDto requestDto) {
        Long childId = requestDto.getChildId();

        // 날짜를 LocalDateTime 범위로 변환
        LocalDateTime start = requestDto.getDate().atStartOfDay();
        LocalDateTime end = requestDto.getDate().atTime(LocalTime.MAX);

        //1.  STT 결과 + 원문 문장 조회
        List<SpeechResult> results =
                speechResultRepository.findWithSentenceByChildIdAndCreatedAtBetween(childId, start, end);

        if (results.isEmpty()) {
            System.out.println("❌ 해당 날짜의 STT 결과가 없습니다.");
            return;
        }

        // 디버깅 로그 출력
        results.forEach(result -> {
            System.out.println("📘 원문: " + result.getSentence().getSentence());
            System.out.println("🎙️ STT : " + result.getSttText());
            System.out.println("-----------");
        });

        //2. FastAPI 요청 dto 구성
        FeedbackEvalRequestDto requestBody = new FeedbackEvalRequestDto();
        requestBody.setChildId(childId);
        requestBody.setDate(requestDto.getDate());

        List<FeedbackEvalRequestDto.SentencePair> sentencePairs = new ArrayList<>();
        for (SpeechResult result : results) {
            FeedbackEvalRequestDto.SentencePair pair = new FeedbackEvalRequestDto.SentencePair();
            pair.setSentenceId(result.getSentence().getId());
            pair.setOriginal(result.getSentence().getSentence());
            pair.setStt(result.getSttText());
            sentencePairs.add(pair);
        }
        requestBody.setSentences(sentencePairs);

        //3. FastAPI로 전송
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<FeedbackEvalRequestDto> httpEntity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<FeedbackEvalResponseDto> response = restTemplate.postForEntity(
                "http://localhost:8000/api/v1/feedback/eval",
                httpEntity,
                FeedbackEvalResponseDto.class
        );

        if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
            System.out.println("FastAPI 응답 실패 또는 본문 없음");
            return;
        }

        FeedbackEvalResponseDto res = response.getBody();

        // 4. DB 저장
        Member child = memberRepository.findById(childId)
                .orElseThrow(() -> new IllegalArgumentException("아동이 존재하지 않습니다."));

        Storybook storybook = storybookRepository.findById(requestDto.getStorybookId())
                .orElseThrow(() -> new RuntimeException("동화책 정보를 찾을 수 없습니다."));


        SessionFeedback feedback = SessionFeedback.builder()
                .child(child)
                .storybook(storybook)
                .date(requestDto.getDate())
                .accuracy(res.getAccuracy())
                .feedbackText(res.getFeedbackText())
                .lastPage(requestDto.getLastPage())
                .createdAt(LocalDateTime.now())
                .build();

        sessionFeedbackRepository.save(feedback);
        System.out.println("✅ SessionFeedback 저장 완료");
    }
}
