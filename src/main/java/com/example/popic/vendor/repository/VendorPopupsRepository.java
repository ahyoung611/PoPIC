package com.example.popic.vendor.repository;

import com.example.popic.entity.entities.*;
import com.example.popic.vendor.service.VendorPopupsService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class VendorPopupsRepository {

    @PersistenceContext
    private EntityManager em;

    // 특정 벤더의 팝업 목록 조회
    public List<PopupStore> findStoresByVendorId(Long vendorId) {
        Vendor vendorRef = em.getReference(Vendor.class, vendorId);
        return em.createQuery(
                        "select distinct ps " +
                                "from PopupStore ps " +
                                "left join fetch ps.address " +
                                "left join fetch ps.vendor " +
                                "left join fetch ps.images " +
                                "where ps.vendor = :vendor " +
                                "order by ps.store_id desc",
                        PopupStore.class)
                .setParameter("vendor", vendorRef)
                .getResultList();
    }

    // 주소 - 시 목록
    public List<String> findDistinctCities() {
        return em.createQuery(
                "select distinct a.city from Address a order by a.city", String.class
        ).getResultList();
    }

    // 주소 - 특정 시의 구 목록
    public List<String> findDistrictsByCity(String city) {
        return em.createQuery(
                        "select distinct a.district from Address a " +
                                "where a.city = :city order by a.district", String.class
                ).setParameter("city", city)
                .getResultList();
    }

    // 카테고리 전체 조회
    public List<VendorPopupsService.CatRow> findAllCategories() {
        List<Category> list = em.createQuery(
                "select c from Category c order by c.category_id", Category.class
        ).getResultList();
        return list.stream()
                .map(c -> new VendorPopupsService.CatRow(c.getCategory_id(), c.getName()))
                .toList();
    }

    // 시/구로 주소 조회
    public Optional<Address> findAddressByCityDistrict(String city, String district) {
        return em.createQuery(
                        "SELECT a FROM Address a WHERE a.city = :city AND a.district = :district", Address.class)
                .setParameter("city", city)
                .setParameter("district", district)
                .getResultStream().findFirst();
    }

    // 스케줄 저장
    public void saveSchedules(List<PopupStoreSchedule> schedules) {
        for (PopupStoreSchedule s : schedules) em.persist(s);
    }

    // 슬롯 저장
    public void saveSlots(List<PopupStoreSlot> slots) {
        for (PopupStoreSlot slot : slots) em.persist(slot);
    }

    // 팝업 스토어 저장
    public void saveStore(PopupStore store) { em.persist(store); }

    // 이미지 저장
    public void saveImages(List<Image> images) { images.forEach(em::persist); }

    // 스토어 엔티티 조회
    public Optional<PopupStore> findStoreById(Long id) {
        return Optional.ofNullable(em.find(PopupStore.class, id));
    }

    // 이미지 엔티티 조회
    public Optional<Image> findImageById(Long id) {
        return Optional.ofNullable(em.find(Image.class, id));
    }

    // 카테고리 id목록으로 엔티티 조회
    public List<Category> findCategoriesByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return List.of();
        return em.createQuery("select c from Category c where c.category_id in :ids", Category.class)
                .setParameter("ids", ids)
                .getResultList();
    }

    // 스토어 이미지 목록
    public List<Image> findImagesByStoreId(Long storeId) {
        return em.createQuery(
                        "select i from Image i where i.popupStore.store_id = :id", Image.class)
                .setParameter("id", storeId)
                .getResultList();
    }

    // 상세 조회
    public Optional<PopupStore> findStoreDetailById(Long id) {
        return em.createQuery(
                        "select ps from PopupStore ps " +
                                " left join fetch ps.address " +
                                " left join fetch ps.vendor " +
                                " left join fetch ps.images " +
                                " where ps.store_id = :id", PopupStore.class)
                .setParameter("id", id)
                .getResultStream()
                .findFirst();
    }

    // 이미지 삭제
    public void deleteImage(Image image) { em.remove(image); }

    // 스토어 삭제
    public void deleteStore(PopupStore store) {
        PopupStore managed = em.contains(store) ? store : em.merge(store);
        em.remove(managed);
    }

    // 슬롯 삭제
    public void deleteSlotsByStoreId(Long storeId) {
        em.createQuery("delete from PopupStoreSlot s where s.schedule.popupStore.store_id = :id")
                .setParameter("id", storeId).executeUpdate();
    }

    // 스케줄 삭제
    public void deleteSchedulesByStoreId(Long storeId) {
        em.createQuery("delete from PopupStoreSchedule sch where sch.popupStore.store_id = :id")
                .setParameter("id", storeId).executeUpdate();
    }

    // 슬롯 조인 삭제
    public List<PopupStoreSlot> findSlotsByStoreId(Long storeId) {
        return em.createQuery(
                "select sl from PopupStoreSlot sl where sl.schedule.popupStore.store_id = :id " +
                        "order by sl.schedule.date, sl.start_time",
                PopupStoreSlot.class
        ).setParameter("id", storeId).getResultList();
    }

    // 스케줄 조인 삭제
    public List<PopupStoreSchedule> findSchedulesByStoreId(Long storeId) {
        return em.createQuery(
                "select sch from PopupStoreSchedule sch where sch.popupStore.store_id = :id " +
                        "order by sch.date, sch.start_time",
                PopupStoreSchedule.class
        ).setParameter("id", storeId).getResultList();
    }

    // 카테고리 조인 삭제
    public void deleteCategoryLinksByStoreId(Long storeId) {
        em.createNativeQuery("DELETE FROM popupstore_category WHERE store_id = ?1")
                .setParameter(1, storeId)
                .executeUpdate();
    }

}
