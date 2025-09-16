package com.example.popic.board.repository;


import com.example.popic.entity.entities.Board;
import org.springframework.data.jpa.repository.JpaRepository;


public interface BoardRepository extends JpaRepository<Board, Long> {

}
