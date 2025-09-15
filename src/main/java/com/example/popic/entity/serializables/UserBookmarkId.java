package com.example.popic.entity.serializables;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class UserBookmarkId implements Serializable {
    private Long user_id;
    private Long store_id;
}
