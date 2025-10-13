package com.example.popic.category;

import com.example.popic.category.repository.CategoryRepository;
import com.example.popic.entity.entities.Category;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

import java.io.InputStream;
import java.util.List;

@Component
@RequiredArgsConstructor
public class CategoryDataLoader implements CommandLineRunner {
    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() > 0) {
            System.out.println("[CategoryDataLoader] Categories already initialized. Skip loading.");
            return;
        }

        ObjectMapper objectMapper = new ObjectMapper();

        // JAR 내부 리소스에서도 동작
        try (InputStream is = new ClassPathResource("categories.json").getInputStream()) {
            List<Category> categories = objectMapper.readValue(
                    is, new TypeReference<List<Category>>() {
                    }
            );
            categoryRepository.saveAll(categories);
            System.out.println("[CategoryDataLoader] Categories loaded successfully! rows=" + categories.size());
        } catch (Exception e) {
            System.err.println("[CategoryDataLoader] Failed to load categories: " + e.getMessage());
        }
    }
}


//@Override
//public void run(String... args) throws Exception {
//    ObjectMapper objectMapper = new ObjectMapper();
//
//    if (categoryRepository.count() == 0) {
//        try {
//            List<Category> categories = objectMapper.readValue(
//                    new File("src/main/resources/categories.json"),
//                    new TypeReference<List<Category>>() {
//                    }
//            );
//
//            categoryRepository.saveAll(categories);
//            System.out.println("Categories loaded successfully!");
//
//        } catch (Exception e) {
//            System.err.println("Failed to load categories: " + e.getMessage());
//        }
//    }
//}