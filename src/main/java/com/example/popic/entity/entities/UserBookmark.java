package com.example.popic.entity.entities;

import com.example.entity.Serializables.UserBookmarkId;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserBookmark {
    @EmbeddedId
    private UserBookmarkId id;

    @ManyToOne
    @MapsId("user_id")  // UserBookmark.user_id와 매핑
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @MapsId("store_id") // UserBookmark.store_id와 매핑
    @JoinColumn(name = "store_id")
    private PopupStore store;

}
