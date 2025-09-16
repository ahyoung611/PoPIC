package com.example.popic.popup.repository;


import com.example.popic.entity.entities.PopupStore;
import org.springframework.data.jpa.repository.JpaRepository;


public interface PopupRepository extends JpaRepository<PopupStore, Long> {

}
