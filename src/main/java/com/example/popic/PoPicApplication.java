package com.example.popic;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PoPicApplication {

    public static void main(String[] args) {
        SpringApplication.run(PoPicApplication.class, args);
    }

}
