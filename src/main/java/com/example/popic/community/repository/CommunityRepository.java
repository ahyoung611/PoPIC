package com.example.popic.community.repository;


import com.example.popic.entity.entities.Board;
import org.springframework.data.jpa.repository.JpaRepository;


public interface CommunityRepository extends JpaRepository<Board, Long> {

}
