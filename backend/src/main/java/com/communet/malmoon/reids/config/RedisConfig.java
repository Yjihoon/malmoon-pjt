package com.communet.malmoon.reids.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Redis 설정 클래스
 * RedisTemplate을 Bean으로 등록하여 Redis와의 데이터 입출력을 쉽게 처리할 수 있도록 구성
 */
@Configuration
public class RedisConfig {
	/**
	 * RedisTemplate Bean 등록
	 * - Key는 문자열(String)로 직렬화
	 * - Value는 JSON 형식으로 직렬화 (객체 → JSON)
	 *
	 * @param connectionFactory Redis 연결을 위한 팩토리 (Spring이 자동 주입)
	 * @return RedisTemplate<String, Object>
	 */
	@Bean
	public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
		RedisTemplate<String, Object> template = new RedisTemplate<>();

		// Redis 연결 팩토리 설정 (Lettuce or Jedis 기반)
		template.setConnectionFactory(connectionFactory);

		// Key를 문자열로 직렬화 (key가 사람이 읽을 수 있는 형태로 저장됨)
		template.setKeySerializer(new StringRedisSerializer());

		// Value를 JSON 형태로 직렬화 (객체 → JSON, JSON → 객체 변환 지원)
		template.setValueSerializer(new GenericJackson2JsonRedisSerializer());

		return template;
	}
}
