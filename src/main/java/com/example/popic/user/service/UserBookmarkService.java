package com.example.popic.user.service;

import com.example.popic.entity.entities.User;
import com.example.popic.entity.entities.PopupStore;
import com.example.popic.entity.entities.UserBookmark;
import com.example.popic.entity.serializables.UserBookmarkId;
import com.example.popic.user.repository.UserBookmarkRepository;
import com.example.popic.user.repository.UserRepository;
import com.example.popic.vendor.repository.VendorPopupsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserBookmarkService {

    private final UserBookmarkRepository bookmarkRepo;
    private final UserRepository userRepo;
    private final VendorPopupsRepository popupRepo;

    @Transactional
    public boolean toggleBookmark(Long userId, Long storeId) {
        UserBookmarkId id = new UserBookmarkId(userId, storeId);

        if (bookmarkRepo.existsById(id)) {
            bookmarkRepo.deleteById(id);
            return false;
        } else {
            User user = userRepo.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            PopupStore store = popupRepo.findStoreById(storeId)
                    .orElseThrow(() -> new IllegalArgumentException("Store not found"));

            UserBookmark bookmark = new UserBookmark();
            bookmark.setId(id);
            bookmark.setUser(user);
            bookmark.setStore(store);
            bookmarkRepo.save(bookmark);
            return true;
        }
    }

    @Transactional(readOnly = true)
    public boolean isBookmarked(Long userId, Long storeId) {
        UserBookmarkId id = new UserBookmarkId(userId, storeId);
        return bookmarkRepo.existsById(id);
    }

    @Transactional(readOnly = true)
    public List<Long> listStoreIdsByUser(Long userId) {
        return bookmarkRepo.findAllByUserId(userId)
                .stream()
                .map(ub -> ub.getId().getStore_id())
                .toList();
    }
}
