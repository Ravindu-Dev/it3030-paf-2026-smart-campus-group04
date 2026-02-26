package com.smartcampus.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

/**
 * Enables MongoDB auditing for @CreatedDate and @LastModifiedDate annotations.
 * Separated from SecurityConfig to keep configurations focused.
 */
@Configuration
@EnableMongoAuditing
public class MongoConfig {
}
