package com.mnemo.memoryengine;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableCaching
@EnableAsync
@EnableKafka
public class MemoryEngineApplication {
    public static void main(String[] args) {
        SpringApplication.run(MemoryEngineApplication.class, args);
    }
}
