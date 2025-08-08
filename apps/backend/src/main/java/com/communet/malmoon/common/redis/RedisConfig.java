package com.communet.malmoon.common.redis;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    @Bean(name = "redisTemplate0") // 화상 세션용
    public RedisTemplate<String, Object> redisTemplate0() {
        return createRedisTemplate(0);
    }

    @Bean(name = "redisTemplate1") // 채팅 세션용
    public RedisTemplate<String, Object> redisTemplate1() {
        return createRedisTemplate(1);
    }

    private RedisTemplate<String, Object> createRedisTemplate(int dbIndex) {
        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration("localhost", 6379);
        config.setDatabase(dbIndex);
        LettuceConnectionFactory factory = new LettuceConnectionFactory(config);
        factory.afterPropertiesSet();

        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        return template;
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();

        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());           // 🔑 키를 문자열로 저장
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer()); // 📦 값은 JSON
        template.setHashKeySerializer(new StringRedisSerializer());       // 해시 키도 문자열
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer()); // 해시 값도 JSON

        return template;
    }
}
