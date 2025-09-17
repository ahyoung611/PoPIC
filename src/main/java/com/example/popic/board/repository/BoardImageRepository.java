package com.example.popic.board.repository;

import com.example.popic.entity.entities.BoardImage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardImageRepository extends JpaRepository<BoardImage, Long>
{
}
