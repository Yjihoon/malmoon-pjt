package com.communet.malmoon.storybook.controller;

import com.communet.malmoon.storybook.dto.SessionFeedbackRequestDto;
import com.communet.malmoon.storybook.service.SessionFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/session-feedback")
@RequiredArgsConstructor
public class SessionFeedbackController {

    private final SessionFeedbackService sessionFeedbackService;

    @PostMapping("/end")
    public ResponseEntity<String> endSessionAndGenerateFeedback(
            @RequestBody SessionFeedbackRequestDto requestDto
    ) {
        sessionFeedbackService.processFeedbackAfterLesson(requestDto);
        return ResponseEntity.ok("세션 종료 및 피드백 생성 완료");
    }
}
