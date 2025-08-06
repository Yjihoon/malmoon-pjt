package com.communet.malmoon.redis;

import static org.assertj.core.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.RedisTemplate;

@SpringBootTest
public class RedisConnectionTest {

	@Autowired
	private RedisTemplate<String, Object> redisTemplate;

	@Test
	void redis_연결_및_데이터_저장_조회_테스트() {
		// given
		String key = "testKey";
		String value = "Hello Redis!";

		// when
		redisTemplate.opsForValue().set(key, value);
		Object result = redisTemplate.opsForValue().get(key);

		// then
		assertThat(result).isEqualTo(value);
		System.out.println("Redis 테스트 성공 : " + result);
	}
}
