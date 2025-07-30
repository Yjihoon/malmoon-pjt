package com.communet.malmoon.aac;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import com.communet.malmoon.aac.controller.AacController;
import com.communet.malmoon.aac.domain.Aac;
import com.communet.malmoon.aac.dto.response.AacGetRes;
import com.communet.malmoon.aac.service.AacService;
import com.fasterxml.jackson.databind.ObjectMapper;

@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(AacController.class)
@Import(AacGetControllerTest.MockConfig.class)
class AacGetControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private AacService aacService;

	@Autowired
	private ObjectMapper objectMapper;

	private final String apiUrl = "/api/v1/aacs";

	@TestConfiguration
	static class MockConfig {
		@Bean
		public AacService aacService() {
			return org.mockito.Mockito.mock(AacService.class);
		}
	}

	private Page<AacGetRes> createMockPage() {
		AacGetRes mockRes = AacGetRes.from(
			Aac.builder()
				.id(1L)
				.name("학교 도와줘")
				.situation("학교")
				.action("도움요청")
				.emotion("기쁨")
				.fileId(99L)
				.build(),
			"https://fake-s3-url.com/image.jpg"
		);

		return new PageImpl<>(List.of(mockRes), PageRequest.of(0, 10), 1);
	}

	@Nested
	@DisplayName("AAC 목록 조회 성공 케이스")
	class SuccessCases {

		@Test
		@DisplayName("모든 필터 값이 있을 때")
		void allParamsExist() throws Exception {
			when(aacService.getAacList(any())).thenReturn(createMockPage());

			MvcResult result = mockMvc.perform(
					MockMvcRequestBuilders.get(apiUrl)
						.param("situation", "학교")
						.param("action", "도움요청")
						.param("emotion", "기쁨")
						.param("page", "0")
						.param("size", "10")
						.contentType(MediaType.APPLICATION_JSON)
				).andExpect(status().isOk())
				.andExpect(jsonPath("$.content[0].id").value(1))
				.andExpect(jsonPath("$.content[0].fileId").value("https://fake-s3-url.com/image.jpg"))
				.andReturn();

			String content = result.getResponse().getContentAsString();
			System.out.println("응답 결과: " + content);
		}

		@Test
		@DisplayName("situation만 없을 때")
		void noSituation() throws Exception {
			when(aacService.getAacList(any())).thenReturn(createMockPage());

			MvcResult result = mockMvc.perform(
					MockMvcRequestBuilders.get(apiUrl)
						.param("action", "도움요청")
						.param("emotion", "기쁨")
						.param("page", "0")
						.param("size", "10")
						.contentType(MediaType.APPLICATION_JSON)
				).andExpect(status().isOk())
				.andExpect(jsonPath("$.content[0].id").value(1))
				.andExpect(jsonPath("$.content[0].fileId").value("https://fake-s3-url.com/image.jpg"))
				.andReturn();

			String content = result.getResponse().getContentAsString();
			System.out.println("응답 결과: " + content);
		}

		@Test
		@DisplayName("action만 없을 때")
		void noAction() throws Exception {
			when(aacService.getAacList(any())).thenReturn(createMockPage());

			MvcResult result = mockMvc.perform(
					MockMvcRequestBuilders.get(apiUrl)
						.param("situation", "학교")
						.param("emotion", "기쁨")
						.param("page", "0")
						.param("size", "10")
						.contentType(MediaType.APPLICATION_JSON)
				).andExpect(status().isOk())
				.andExpect(jsonPath("$.content[0].id").value(1))
				.andExpect(jsonPath("$.content[0].fileId").value("https://fake-s3-url.com/image.jpg"))
				.andReturn();

			String content = result.getResponse().getContentAsString();
			System.out.println("응답 결과: " + content);
		}

		@Test
		@DisplayName("emotion만 없을 때")
		void noEmotion() throws Exception {
			when(aacService.getAacList(any())).thenReturn(createMockPage());

			MvcResult result = mockMvc.perform(
					MockMvcRequestBuilders.get(apiUrl)
						.param("situation", "학교")
						.param("action", "도움요청")
						.param("page", "0")
						.param("size", "10")
						.contentType(MediaType.APPLICATION_JSON)
				).andExpect(status().isOk())
				.andExpect(jsonPath("$.content[0].id").value(1))
				.andExpect(jsonPath("$.content[0].fileId").value("https://fake-s3-url.com/image.jpg"))
				.andReturn();

			String content = result.getResponse().getContentAsString();
			System.out.println("응답 결과: " + content);
		}

		@Test
		@DisplayName("모든 필터가 없을 때 (기본 상태만 적용)")
		void noFilters() throws Exception {
			when(aacService.getAacList(any())).thenReturn(createMockPage());

			MvcResult result = mockMvc.perform(
					MockMvcRequestBuilders.get(apiUrl)
						.param("page", "0")
						.param("size", "10")
						.contentType(MediaType.APPLICATION_JSON)
				).andExpect(status().isOk())
				.andExpect(jsonPath("$.content[0].id").value(1))
				.andExpect(jsonPath("$.content[0].fileId").value("https://fake-s3-url.com/image.jpg"))
				.andReturn();

			String content = result.getResponse().getContentAsString();
			System.out.println("응답 결과: " + content);
		}
	}
}
