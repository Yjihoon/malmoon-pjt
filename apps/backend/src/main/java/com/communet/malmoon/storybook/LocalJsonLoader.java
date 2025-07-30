package com.communet.malmoon.storybook;

import com.communet.malmoon.storybook.dto.StorybookRequestDto;
import com.communet.malmoon.storybook.service.StorybookService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.File;

@Component
@RequiredArgsConstructor
public class LocalJsonLoader implements CommandLineRunner {

    private final StorybookService storybookService;

    @Override
    public void run(String... args) throws Exception {
        ObjectMapper mapper = new ObjectMapper();

        File folder = new File("src/main/resources/jsons"); // 📂 여러 JSON이 있는 폴더
        File[] files = folder.listFiles((dir, name) -> name.endsWith(".json"));

        if (files == null || files.length == 0) {
            System.out.println("⚠️ JSON 파일이 없습니다.");
            return;
        }

        int success = 0;
        int fail = 0;

        for (File file : files) {
            try {
                StorybookRequestDto dto = mapper.readValue(file, StorybookRequestDto.class);
                storybookService.save(dto);
                success++;
                System.out.println("✅ 저장 완료: " + file.getName());
            } catch (Exception e) {
                fail++;
                System.out.println("❌ 저장 실패: " + file.getName());
                e.printStackTrace();
            }
        }
        System.out.printf("\n전체 처리 결과: 총 %d개 중 %d개 성공, %d개 실패\n", files.length, success, fail);
    }
}
