package com.communet.malmoon.storybook;

import com.communet.malmoon.storybook.dto.StorybookRequestDto;
import com.communet.malmoon.storybook.service.StorybookDataLoadService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;

/**
 * 로컬 JSON 파일들을 읽어와서 DB에 저장하는 유틸리티
 * - 앱 실행 시 자동 실행됨 (CommandLineRunner)
 */
@Component
@RequiredArgsConstructor
public class LocalJsonLoader implements CommandLineRunner {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final StorybookDataLoadService dataLoadService;

    private static final String JSON_DIR = "src/main/resources/jsons";

    @Override
    public void run(String... args) throws Exception {
        Files.list(Paths.get(JSON_DIR))
                .filter(path -> path.toString().endsWith(".json"))
                .forEach(path -> {
                    try {
                        StorybookRequestDto dto = objectMapper.readValue(path.toFile(), StorybookRequestDto.class);
                        dataLoadService.save(dto);
                        System.out.println("✅ 저장 완료: " + dto.getTitle());
                    } catch (Exception e) {
                        System.err.println("❌ 저장 실패: " + path.getFileName() + " → " + e.getMessage());
                    }
                });
    }
}
