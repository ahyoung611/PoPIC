package com.example.popic.address.repository;

import com.example.popic.entity.entities.Address;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AddressRepository extends JpaRepository<Address,Long> {
    boolean existsByCityAndDistrict(String city, String district);
}
