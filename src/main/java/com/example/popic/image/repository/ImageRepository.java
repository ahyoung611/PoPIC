package com.example.popic.image.repository;


import com.example.popic.entity.entities.Image;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImageRepository extends JpaRepository<Image,Long> {

}
