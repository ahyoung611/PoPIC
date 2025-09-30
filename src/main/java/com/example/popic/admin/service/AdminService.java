package com.example.popic.admin.service;

import com.example.popic.popup.dto.PopupDTO;
import com.example.popic.popup.repository.PopupRepository;
import com.example.popic.popup.service.PopupService;
import com.example.popic.user.dto.UserDTO;
import com.example.popic.user.repository.UserRepository;
import com.example.popic.vendor.dto.VendorDTO;
import com.example.popic.vendor.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final PopupRepository popupRepository;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;

    public List<PopupDTO> getPopupStatus(String sort, String keyword){
        return switch (sort) {
            case "approved" -> popupRepository.findApprovedPopup(keyword).stream()
                    .map(PopupDTO::new).collect(Collectors.toList());
            case "rejected" -> popupRepository.findRejectedPopup(keyword).stream()
                    .map(PopupDTO::new).collect(Collectors.toList());
            default -> popupRepository.findPendingPopup(keyword).stream()
                    .map(PopupDTO::new).collect(Collectors.toList());
        };
    }

    public void updatePopupStatus(Long popupId, int statusCode) {
        popupRepository.updatePopupStatus(popupId, statusCode);
    }

    // 상태에 다른 조절
    private Integer mapSortToStatus(String sort, boolean vendor) {
        if (sort == null || sort.isBlank()) return null; // 전체

        try {
            int code = Integer.parseInt(sort);
            if (code == 0 || code == 1 || (vendor && (code == 2 || code == 3))) {
                return code;
            }
        } catch (NumberFormatException ignored) {}

        return switch (sort) {
            case "normal" -> 1;
            case "blocked" -> 0;
            case "deleted" -> -1;          // (유저 용도; 벤더엔 안 씀)
            case "pending" -> vendor ? 2 : null;
            case "rejected" -> vendor ? 3 : null;
            default -> null;
        };
    }

    // 정렬 & 리스트업
    public List<UserDTO> findUsers(String sort, String keyword) {
        Integer status = mapSortToStatus(sort, false);
        return userRepository.search(status, keyword).stream()
                .map(UserDTO::new)
                .toList();
    }

    public List<VendorDTO> findVendors(String sort, String keyword) {
        Integer status = mapSortToStatus(sort, true);
        return vendorRepository.search(status, keyword).stream()
                .map(VendorDTO::new)
                .toList();
    }

    // 사용 상태 변경
    @Transactional
    public void updateUserStatus(Long id, int status) {
        userRepository.updateStatus(id, status);
    }

    @Transactional
    public void updateVendorStatus(Long id, int status) {
        vendorRepository.updateStatus(id, status);
    }
}
