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
        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery(
                "SELECT category_id, name FROM category ORDER BY category_id"
        ).getResultList();
        return rows.stream()
                .map(r -> new VendorPopupsService.CatRow(((Number) r[0]).longValue(), (String) r[1]))
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
    public Vendor getVendorRef(Long id) { return em.getReference(Vendor.class, id); }
}
