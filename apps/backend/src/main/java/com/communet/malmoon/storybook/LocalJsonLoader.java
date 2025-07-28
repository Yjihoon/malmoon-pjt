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
        File file = new File("src/main/resources/jsons/03_01T_01S_9788961915632.json");

        ObjectMapper mapper = new ObjectMapper();
        StorybookRequestDto dto = mapper.readValue(file, StorybookRequestDto.class);

        storybookService.save(dto);

        System.out.println("✅ 동화 저장 완료!");
    }
}
