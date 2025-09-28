package com.example.popic.user.repository;

import com.example.popic.entity.entities.PopupStore;
import com.example.popic.entity.entities.UserBookmark;
import com.example.popic.entity.serializables.UserBookmarkId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserBookmarkRepository extends JpaRepository<UserBookmark, UserBookmarkId> {

    boolean existsById(UserBookmarkId id);
    void deleteById(UserBookmarkId id);

    @Query("SELECT ub FROM UserBookmark ub WHERE ub.user.login_id = :loginId")
    List<UserBookmark> findByUserLoginId(@Param("loginId") String loginId);

}

