package com.example.popic.user.controller;

import com.example.popic.entity.entities.PopupStore;
import com.example.popic.popup.dto.PopupDTO;
import com.example.popic.security.JwtUtil;
import com.example.popic.user.service.UserBookmarkService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/userBookmark")
public class UserBookmarkController {

    private final UserBookmarkService userBookmarkService;
    private final JwtUtil jwtUtil;

    @PostMapping("/toggle")
    public boolean toggleBookmark(@RequestParam Long userId, @RequestParam Long storeId) {
        return userBookmarkService.toggleBookmark(userId, storeId);
    }

    @GetMapping("/status")
    public boolean getBookmarkStatus(@RequestParam Long userId, @RequestParam Long storeId) {
        return userBookmarkService.isBookmarked(userId, storeId);
    }

    @GetMapping("/popupList")
    public List<PopupDTO> getBookmarkedStores(HttpServletRequest request) {
        // JWT에서 loginId 추출
        String token = request.getHeader("Authorization").replace("Bearer ", "");
        String loginId = jwtUtil.getSubject(token);

        // 북마크 PopupStore 조회
        List<PopupStore> stores = userBookmarkService.findBookmarkedStoresByLoginId(loginId);

        // DTO로 변환
        return stores.stream()
                .map(PopupDTO::new)
                .collect(Collectors.toList());
    }

}
