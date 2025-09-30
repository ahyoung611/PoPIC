package com.example.popic.entity.entities;

import com.example.popic.entity.serializables.UserBookmarkId;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
public class UserBookmark {
    @EmbeddedId
    @AttributeOverrides({
            @AttributeOverride(name = "user_id", column = @Column(name = "user_id")),
            @AttributeOverride(name = "store_id", column = @Column(name = "store_id"))
    })
    private UserBookmarkId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("user_id")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("store_id")
    @JoinColumn(name = "store_id")
    private PopupStore store;
}
