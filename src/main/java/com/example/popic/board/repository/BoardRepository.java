package com.example.popic.board.repository;

import com.example.popic.entity.entities.Board;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface BoardRepository extends JpaRepository<Board, Long> {



    @Query("select b from Board b order by b.created_at desc")
    Page<Board> listAll(Pageable pageable);

    @Query(value = """
        select b from Board b
        where lower(b.title) like lower(concat('%', :kw, '%'))
        """, countQuery = """
        select count(b) from Board b
        where lower(b.title) like lower(concat('%', :kw, '%'))
        """)
    Page<Board> searchByTitle(@Param("kw") String keyword, Pageable pageable);

    @Query(value = """
        select b from Board b
        where lower(b.content) like lower(concat('%', :kw, '%'))
        """, countQuery = """
        select count(b) from Board b
        where lower(b.content) like lower(concat('%', :kw, '%'))
        """)
    Page<Board> searchByContent(@Param("kw") String keyword, Pageable pageable);

    @Query(value = """
        select b from Board b
        where lower(b.title) like lower(concat('%', :kw, '%'))
           or lower(b.content) like lower(concat('%', :kw, '%'))
        """, countQuery = """
        select count(b) from Board b
        where lower(b.title) like lower(concat('%', :kw, '%'))
           or lower(b.content) like lower(concat('%', :kw, '%'))
        """)
    Page<Board> searchByTitleOrContent(@Param("kw") String keyword, Pageable pageable);

    @Modifying
    @Query("update Board b set b.view_count = coalesce(b.view_count, 0) + 1 where b.boardId = :id")
    int increaseView(@Param("id") Long id);
}
