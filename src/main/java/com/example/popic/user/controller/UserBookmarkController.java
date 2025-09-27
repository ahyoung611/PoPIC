package com.example.popic.user.controller;

import com.example.popic.user.service.UserBookmarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/userBookmark")
public class UserBookmarkController {

    private final UserBookmarkService bookmarkService;

    @PostMapping("/toggle")
    public boolean toggleBookmark(@RequestParam Long userId, @RequestParam Long storeId) {
        return bookmarkService.toggleBookmark(userId, storeId);
    }

    @GetMapping("/status")
    public boolean getBookmarkStatus(@RequestParam Long userId, @RequestParam Long storeId) {
        return bookmarkService.isBookmarked(userId, storeId);
    }

    @GetMapping
    public List<Long> list(@RequestParam("userId") Long userId) {
        return bookmarkService.listStoreIdsByUser(userId);
    }
}
