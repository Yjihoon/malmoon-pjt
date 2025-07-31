package com.communet.malmoon.common.redis;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;

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
        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration("localhost", 6380);
        config.setDatabase(dbIndex);
        LettuceConnectionFactory factory = new LettuceConnectionFactory(config);
        factory.afterPropertiesSet();

        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        return template;
    }
}
