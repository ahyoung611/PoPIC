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

    public List<PopupStore> findAllStores() {
        return em.createQuery(
                "select distinct ps " +
                        "from PopupStore ps " +
                        "left join fetch ps.address " +
                        "left join fetch ps.vendor " +
                        "left join fetch ps.images " +   // 이미지 1개 컬렉션만 fetch
                        "order by ps.store_id desc",
                PopupStore.class
        ).getResultList();
    }

    // 도시 목록
    public List<String> findDistinctCities() {
        return em.createQuery(
                "select distinct a.city from Address a order by a.city", String.class
        ).getResultList();
    }

    // 특정 도시의 구 목록
    public List<String> findDistrictsByCity(String city) {
        return em.createQuery(
                        "select distinct a.district from Address a " +
                                "where a.city = :city order by a.district", String.class
                ).setParameter("city", city)
                .getResultList();
    }

    public List<VendorPopupsService.CatRow> findAllCategories() {
        List<Category> list = em.createQuery(
                "select c from Category c order by c.category_id", Category.class
        ).getResultList();
        return list.stream()
                .map(c -> new VendorPopupsService.CatRow(c.getCategory_id(), c.getName()))
                .toList();
    }

    public Optional<Address> findAddressByCityDistrict(String city, String district) {
        return em.createQuery(
                        "SELECT a FROM Address a WHERE a.city = :city AND a.district = :district", Address.class)
                .setParameter("city", city)
                .setParameter("district", district)
                .getResultStream().findFirst();
    }

    public void saveSchedules(List<PopupStoreSchedule> schedules) {
        for (PopupStoreSchedule s : schedules) em.persist(s);
    }

    public void saveSlots(List<PopupStoreSlot> slots) {
        for (PopupStoreSlot slot : slots) em.persist(slot);
    }

    public List<Category> findCategoriesByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return List.of();
        return em.createQuery("select c from Category c where c.category_id in :ids", Category.class)
                .setParameter("ids", ids)
                .getResultList();
    }

    public void saveStore(PopupStore store) { em.persist(store); }
    public void saveImages(List<Image> images) { images.forEach(em::persist); }


    public Optional<PopupStore> findStoreById(Long id) {
        return Optional.ofNullable(em.find(PopupStore.class, id));
    }

    public Optional<Image> findImageById(Long id) {
        return Optional.ofNullable(em.find(Image.class, id));
    }

    public void deleteImage(Image image) { em.remove(image); }

    // 상세 조회용
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

    public List<PopupStoreSlot> findSlotsByStoreId(Long storeId) {
        return em.createQuery(
                "select sl from PopupStoreSlot sl where sl.schedule.popupStore.store_id = :id " +
                        "order by sl.schedule.date, sl.start_time",
                PopupStoreSlot.class
        ).setParameter("id", storeId).getResultList();
    }

    public List<PopupStoreSchedule> findSchedulesByStoreId(Long storeId) {
        return em.createQuery(
                "select sch from PopupStoreSchedule sch where sch.popupStore.store_id = :id " +
                        "order by sch.date, sch.start_time",
                PopupStoreSchedule.class
        ).setParameter("id", storeId).getResultList();
    }

    // 슬롯/스케줄 삭제
    public void deleteSlotsByStoreId(Long storeId) {
        em.createQuery("delete from PopupStoreSlot s where s.schedule.popupStore.store_id = :id")
                .setParameter("id", storeId).executeUpdate();
    }
    public void deleteSchedulesByStoreId(Long storeId) {
        em.createQuery("delete from PopupStoreSchedule sch where sch.popupStore.store_id = :id")
                .setParameter("id", storeId).executeUpdate();
    }

    // 스토어-카테고리 조인 테이블 삭제
    public void deleteCategoryLinksByStoreId(Long storeId) {
        em.createNativeQuery("DELETE FROM popupstore_category WHERE store_id = :id")
                .setParameter("id", storeId)
                .executeUpdate();
    }

    // 스토어 삭제
    public void deleteStore(PopupStore store) {
        PopupStore managed = em.contains(store) ? store : em.merge(store);
        em.remove(managed);
    }

    // 스토어 이미지 목록
    public List<Image> findImagesByStoreId(Long storeId) {
        return em.createQuery(
                        "select i from Image i where i.popupStore.store_id = :id", Image.class)
                .setParameter("id", storeId)
                .getResultList();
    }

}
