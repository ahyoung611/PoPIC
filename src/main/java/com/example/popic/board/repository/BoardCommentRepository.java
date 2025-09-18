package com.example.popic.board.repository;

import com.example.popic.entity.entities.BoardComment;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BoardCommentRepository extends JpaRepository<BoardComment, Long> {
    @Query("SELECT c FROM BoardComment c " +
            "WHERE c.board.boardId = :boardId " +
            "AND c.parent IS NULL " +
            "AND c.status = 1 " +
            "ORDER BY c.created_at DESC")
    List<BoardComment> findTopLevelByBoardId(@Param("boardId") Long boardId);
}
