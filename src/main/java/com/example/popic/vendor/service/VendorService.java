package com.example.popic.vendor.service;

import com.example.popic.entity.entities.ROLE;
import com.example.popic.entity.entities.User;
import com.example.popic.entity.entities.Vendor;
import com.example.popic.popup.dto.PopupReservationDTO;
import com.example.popic.popup.repository.ReservationRepository;
import com.example.popic.user.repository.UserRepository;
import com.example.popic.user.service.AccountUserVendorService;
import com.example.popic.vendor.dto.VendorDTO;
import com.example.popic.vendor.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VendorService {
    private final VendorRepository vendorRepository;
    private final ReservationRepository reservationRepository;
    private final PasswordEncoder passwordEncoder;
    private final AccountUserVendorService accountUserVendorService;

    public Long joinVendor(Vendor vendor) {
        accountUserVendorService.assertLoginIdAvailable(vendor.getLogin_id());
        accountUserVendorService.assertBrnAvailable(vendor.getBrn());

        vendor.setPassword(passwordEncoder.encode(vendor.getPassword()));
        vendor.setRole(ROLE.VENDOR);
        vendor.setStatus(2); // 승인대기

        return vendorRepository.save(vendor).getVendor_id();
    }

    // 서버사이드 페이징 적용
    public Page<PopupReservationDTO> getReservationList(Long vendorId, String sort, String keyword, Pageable pageable) {
        int sortNum;
        Page<PopupReservationDTO> result;

        if (sort.contains("reservation")) {
            sortNum = 1;
            result = reservationRepository.getReservationsByVendorIdAndSortNum(vendorId, sortNum, keyword, pageable)
                    .map(PopupReservationDTO::new);
        } else if (sort.contains("complete")) {
            sortNum = 0;
            result = reservationRepository.getReservationsByVendorIdAndSortNum(vendorId, sortNum, keyword, pageable)
                    .map(PopupReservationDTO::new);
        } else if (sort.contains("cancel")) {
            sortNum = -1;
            result = reservationRepository.getReservationsByVendorIdAndSortNum(vendorId, sortNum, keyword, pageable)
                    .map(PopupReservationDTO::new);
        } else {
            result = reservationRepository.getReservationsByVendorId(vendorId, keyword, pageable)
                    .map(PopupReservationDTO::new);
        }

        return result;
    }

    public void updateVendor(Long id, VendorDTO dto) {
        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 벤더가 없습니다."));

        vendor.setVendor_name(dto.getVendor_name());
        vendor.setManager_name(dto.getManager_name());
        vendor.setPhone_number(dto.getPhone_number());
        vendor.setBrn(dto.getBrn());
        if(dto.getPassword() != null && !dto.getPassword().isEmpty()){
            vendor.setPassword(dto.getPassword());
        }

        vendorRepository.save(vendor);
    }
}
