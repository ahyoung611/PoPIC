package com.example.popic.user.service;

import com.example.popic.entity.entities.User;
import com.example.popic.entity.entities.PopupStore;
import com.example.popic.entity.entities.UserBookmark;
import com.example.popic.entity.serializables.UserBookmarkId;
import com.example.popic.popup.repository.PopupRepository;
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

    private final UserBookmarkRepository userBookmarkRepository;
    private final UserRepository userRepository;
    private final VendorPopupsRepository vendorPopupsRepository;
    private final PopupRepository popupRepository;

    @Transactional
    public boolean toggleBookmark(Long userId, Long storeId) {
        UserBookmarkId id = new UserBookmarkId(userId, storeId);

        if (userBookmarkRepository.existsById(id)) {
            userBookmarkRepository.deleteById(id);
            return false;
        } else {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            PopupStore store = vendorPopupsRepository.findStoreById(storeId)
                    .orElseThrow(() -> new IllegalArgumentException("Store not found"));

            UserBookmark bookmark = new UserBookmark();
            bookmark.setId(id);
            bookmark.setUser(user);
            bookmark.setStore(store);
            userBookmarkRepository.save(bookmark);
            return true;
        }
    }

    @Transactional(readOnly = true)
    public boolean isBookmarked(Long userId, Long storeId) {
        UserBookmarkId id = new UserBookmarkId(userId, storeId);
        return userBookmarkRepository.existsById(id);
    }

    public List<PopupStore> findBookmarkedStoresByLoginId(String loginId) {
        List<UserBookmark> bookmarks = userBookmarkRepository.findByUserLoginId(loginId);
        List<PopupStore> stores = bookmarks.stream()
                .map(UserBookmark::getStore)
                .toList();
        return stores;
    }

}
