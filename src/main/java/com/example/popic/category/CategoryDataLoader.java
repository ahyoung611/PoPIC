package com.example.popic.category;

import com.example.popic.category.repository.CategoryRepository;
import com.example.popic.entity.entities.Category;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

import java.io.File;
import java.util.List;

@Component
@RequiredArgsConstructor
public class CategoryDataLoader implements CommandLineRunner {
    private final CategoryRepository categoryRepository;
    private final ObjectMapper objectMapper;

    @Override
    public void run(String... args) throws Exception {

        if (categoryRepository.count() == 0) {
            try {
                List<Category> categories = objectMapper.readValue(
                        new File("src/main/resources/categories.json"),
                        new TypeReference<List<Category>>() {}
                );

                categoryRepository.saveAll(categories);
                System.out.println("Categories loaded successfully!");

            } catch (Exception e) {
                System.err.println("Failed to load categories: " + e.getMessage());
            }
        }

//        System.out.println("--- Current Categories in DB ---");
//        List<Category> allCategories = categoryRepository.findAll();
//        allCategories.forEach(category -> System.out.println("ID: " + category.getCategory_id() + ", Name: " + category.getName()));
//        System.out.println("--------------------------------");
    }
}