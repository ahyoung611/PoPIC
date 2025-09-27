import React, {useState, useCallback, useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";
import AddressSelector from "./AddressSelector.jsx";
import "../../style/vendorPopup.css";
import Button from "../../components/commons/Button.jsx";
import apiRequest from "../../utils/apiRequest.js";
import {useAuth} from "../../context/AuthContext.jsx"

// 상수/헬퍼
const KAKAO_JS_API_KEY = import.meta.env.VITE_KAKAO_JS_API_KEY;
const DAY_TO_ENUM = {
    "월": "MONDAY",
    "화": "TUESDAY",
    "수": "WEDNESDAY",
    "목": "THURSDAY",
    "금": "FRIDAY",
    "토": "SATURDAY",
    "일": "SUNDAY"
};
const DAYS = Object.entries(DAY_TO_ENUM).map(([label, value]) => ({label, value}));
const toYYYYMMDD = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

export default function VendorPopupForm() {
    // 라우트/네비게이션
    const {vendorId, popupId} = useParams();     // /vendor/:vendorId/popups[/edit/:popupId]
    const isEdit = !!popupId;
    const navigate = useNavigate();
    const token = useAuth().getToken();

    // API 엔드포인트 (벤더 스코프)
    const CATEGORY_API = `/api/vendors/${vendorId}/popups/categories`;

    // 폼 상태
    const [form, setForm] = useState({
        store_id: null,
        store_name: "",
        description: "",
        vendor: null,
        categories: [],      // 카테고리 id 배열
        start_date: "",
        end_date: "",
        schedules: [],
        address: "",         // "시 구"
        address_detail: "",
        latitude: null,
        longitude: null,
        price: "",
        images: [],
        join_date: null,
        update_date: null,
        delete_date: null,
        status: 2,
    });

    // UI 전용 상태
    const [imageFiles, setImageFiles] = useState([]);          // 새로 추가할 파일
    const [existingImages, setExistingImages] = useState([]);  // [{id, savedName, url}]
    const [categories, setCategories] = useState([{id: 0, label: "전체"}]);
    const [categorySelect, setCategorySelect] = useState(0);
    const [openDays, setOpenDays] = useState(new Set());
    const [startTime, setStartTime] = useState("10:00");
    const [endTime, setEndTime] = useState("19:00");
    const [capacityPerHour, setCapacityPerHour] = useState("");
    const [imagePreviews, setImagePreviews] = useState([]);    // [{key,name,url,fileIndex}]
    const todayStr = toYYYYMMDD(new Date());

    // 공용 setForm 헬퍼
    const update = (k, v) => setForm((p) => ({...p, [k]: v}));

    const fetchImage = useCallback(async (imageId) => {
            const res = await fetch(`/images?type=popup&id=${imageId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) return null;
            const blob = await res.blob();
            return URL.createObjectURL(blob);
        }, [token]);

    // 카테고리 로드
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const list = await apiRequest(CATEGORY_API, {}, token);
                if (!alive) return;
                setCategories([{id: 0, label: "전체"}, ...list.map(c => ({id: c.id, label: c.name}))]);
            } catch (e) {
                console.error("카테고리 로드 실패:", e);
            }
        })();
        return () => {
            alive = false;
        };
    }, [CATEGORY_API, token]);

    // 수정 모드 – 서버 DTO를 폼에 반영
    useEffect(() => {
        if (!isEdit) return;

        (async () => {
            try {
                const dto = await apiRequest(`/api/vendors/${vendorId}/popups/${popupId}`, {}, token);
                if (!dto) throw new Error("popup data is not valid");

                setForm(prev => ({ ...prev, ...dto, price: dto.price ?? "", vendor: dto.vendor ?? null }));
                setCategorySelect(Array.isArray(dto.categories) && dto.categories.length ? dto.categories[0] : 0);
                setOpenDays(new Set(dto.open_days || []));
                if (dto.open_start_time) setStartTime(dto.open_start_time);
                if (dto.open_end_time) setEndTime(dto.open_end_time);
                if (dto.capacity_per_hour != null) setCapacityPerHour(String(dto.capacity_per_hour));

               const imgs = (dto.images_detail || []).map(img => ({
                   id: img.image_id,
                   displayName: img.original_name,      // UI에 보여줄 이름
                   savedName: img.saved_name,           // 서버에 저장된 파일명
                   url: `/images/popup/${img.saved_name}`
               }));
               setExistingImages(imgs);

            } catch(err){
                console.error("데이터 로드 실패:", err);
                alert("데이터를 불러오지 못했습니다.");
                navigate(`/vendor/${vendorId}/popups`, {replace:true});
            }
        })();
    }, [isEdit, vendorId, popupId, navigate, token]);

    // 새 이미지 프리뷰 관리
       useEffect(()=>{
           const next = imageFiles.map((f,idx)=>({
               key:`new-${f.name}-${f.lastModified}-${idx}`,
               name:f.name,
               url:URL.createObjectURL(f),
               fileIndex: idx
           }));
           setImagePreviews(next);
           return ()=>next.forEach(p=>URL.revokeObjectURL(p.url));
       },[imageFiles]);

       const handleAddrChange = useCallback((v={})=>{
           setForm(prev=>{
               const addr=v.addressString||"";
               const detail=v.detail||"";
               const noChange=prev.address===addr && prev.address_detail===detail
                   && (v.latitude==null||prev.latitude===v.latitude)
                   && (v.longitude==null||prev.longitude===v.longitude);
               if(noChange) return prev;
               return {...prev, address:addr,address_detail:detail,latitude:v.latitude??prev.latitude,longitude:v.longitude??prev.longitude};
           });
       },[]);

    // 파일 선택/삭제
     const handleFiles=(e)=>{
            const files = Array.from(e.target.files||[]);
            setImageFiles(prev=>[...prev,...files]);
            e.target.value="";
        };
        const removeExistingImage = async(imageId)=>{
            if(!confirm("이미지를 삭제할까요?")) return;
            await apiRequest(`/api/vendors/${vendorId}/popups/images/${imageId}`, {method:"DELETE"}, token);
            setExistingImages(list=>list.filter(x=>x.id!==imageId));
        };

    // 폼 유효성 검사
   const validate = ()=>{
       if(!form.store_name.trim()) return "팝업명을 입력해 주세요.";
       if(!form.start_date||!form.end_date) return "운영 기간을 입력해 주세요.";
       if(!form.address) return "시/구를 선택해 주세요.";
       if(!form.address_detail.trim()) return "상세 주소를 입력해 주세요.";
       if(form.latitude==null||form.longitude==null) return "주소를 먼저 적어주세요.";
       if(form.price!=="" && Number.isNaN(Number(form.price))) return "가격은 숫자만 입력해 주세요.";
       if(openDays.size===0) return "운영 요일을 선택해 주세요.";
       if(!startTime||!endTime||startTime>=endTime) return "운영 시간을 확인하세요.";
       if(!capacityPerHour||Number(capacityPerHour)<=0) return "시간당 인원을 입력해 주세요.";
       return null;
   };

    // 제출(등록/수정)
const handleSubmit = async(e)=>{
        e.preventDefault();
        const err = validate();
        if(err) return alert(err);

        const dto = {
            ...form,
            categories: categorySelect===0?[]:[categorySelect],
            open_days:Array.from(openDays),
            open_start_time:startTime,
            open_end_time:endTime,
            capacity_per_hour:Number(capacityPerHour),
            slot_minutes:60,
            price: form.price===""?null:Number(form.price)
        };

        try{
            if(!isEdit){
                const fd = new FormData();
                fd.append("dto", new Blob([JSON.stringify(dto)], {type:"application/json"}));
                imageFiles.forEach(f=>fd.append("files",f));

                const json = await apiRequest(`/api/vendors/${vendorId}/popups`, {method:"POST", body:fd}, token);
                if(!json?.result) return alert(json?.message||"등록 실패");
                navigate(`/vendor/${vendorId}/popups`);
            } else {
                const json = await apiRequest(`/api/vendors/${vendorId}/popups/${popupId}`, {method:"PUT", body:dto}, token);
                if(!json?.result) return alert(json?.message||"수정 실패");

                if(imageFiles.length>0){
                    const fd = new FormData();
                    imageFiles.forEach(f=>fd.append("files",f));
                    const uploaded = await apiRequest(`/api/vendors/${vendorId}/popups/${popupId}/images`, {method:"POST", body:fd}, token);

                    // Blob 제거, URL 바로 사용
                    const newImgs = uploaded.map(img=>({
                        id: img.image_id,
                        savedName: img.saved_name,
                        url: `/images/popup/${img.saved_name}`
                    }));
                    setExistingImages(prev=>[...prev,...newImgs]);
                    setImageFiles([]);
                }
                navigate(`/vendor/${vendorId}/popups`);
            }
        } catch(e){ console.error(e); alert(isEdit?"수정 중 오류":"등록 중 오류"); }
    };

    // 팝업 삭제
    const handleDeletePopup=async()=>{
       if(!confirm("이 팝업을 삭제할까요? 삭제 후 복구할 수 없습니다.")) return;
       await apiRequest(`/api/vendors/${vendorId}/popups/${popupId}`, {method:"DELETE"}, token);
       navigate(`/vendor/${vendorId}/popups`);
   };

    // 파생 값
    const pageTitle = isEdit?"팝업 수정":"팝업 등록";
   const city=form.address?.split(" ")[0]||"";
   const district=form.address?.split(" ")[1]||"";

    // 렌더
    return (
        <div className="container">
            <div className="inner">
                <form className="vp-card" onSubmit={handleSubmit}>
                    <h1 className="vp-title">{pageTitle}</h1>

                    {/* 팝업명 */}
                    <div className="vp-field">
                        <label className="vp-label required">팝업명</label>
                        <input
                            className="vp-input"
                            value={form.store_name}
                            onChange={(e) => update("store_name", e.target.value)}
                            placeholder="예) 마포 시즌 팝업"
                            required
                        />
                    </div>

                    {/* 이미지 추가 */}
                     <div className="vp-field">
                        <label className="vp-label">이미지 추가</label>
                        <label className="vp-input vp-filebox">
                            <input type="file" multiple accept="image/*" onChange={handleFiles}/>
                            {imageFiles.length===0?"파일을 선택하세요":`${imageFiles.length}개 선택됨`}
                        </label>

                        {(existingImages.length>0||imageFiles.length>0)&&(
                            <ul className="vp-file-list">
                               {existingImages.map(img=>{
                                   const deletable = typeof img.id==="number";
                                   return (
                                       <li key={`exist-${img.id}`} className="vp-file-item">
                                           <span className="vp-file-name">{img.displayName}</span>  {/* displayName 사용 */}
                                           <button type="button" className="file-delete" disabled={!deletable} title={deletable?"삭제":"삭제 불가"} onClick={()=>deletable&&removeExistingImage(img.id)}>&times;</button>
                                       </li>
                                   );
                               })}
                                {imageFiles.map((f,i)=>(
                                    <li key={`new-${i}`} className="vp-file-item">
                                        <span className="vp-file-name">{f.name}</span>
                                        <button type="button" className="file-delete" onClick={()=>setImageFiles(prev=>prev.filter((_,idx)=>idx!==i))}>&times;</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* 카테고리 */}
                    <div className="vp-field">
                        <label className="vp-label">카테고리</label>
                        <select
                            className="vp-select"
                            value={categorySelect}
                            onChange={(e) => setCategorySelect(Number(e.target.value))}
                        >
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 운영 기간 */}
                    <div className="vp-grid-2">
                        <div className="vp-field">
                            <label className="vp-label required">운영 기간 (시작)</label>
                            <input
                                type="date"
                                className="vp-input"
                                value={form.start_date ?? ""}
                                onChange={(e) => update("start_date", e.target.value)}
                                min={todayStr}
                                required
                            />
                        </div>
                        <div className="vp-field">
                            <label className="vp-label required">운영 기간 (종료)</label>
                            <input
                                type="date"
                                className="vp-input"
                                value={form.end_date ?? ""}
                                onChange={(e) => update("end_date", e.target.value)}
                                min={form.start_date || todayStr}
                                required
                            />
                        </div>
                    </div>

                    {/* 시간당 인원 수 */}
                    <div className="vp-field">
                        <label className="vp-label">시간당 인원 수</label>
                        <input
                            className="vp-input"
                            inputMode="numeric"
                            value={capacityPerHour}
                            onChange={(e) => setCapacityPerHour(e.target.value)}
                            placeholder="예) 20"
                        />
                    </div>

                    {/* 장소 */}
                    <div className="vp-field">
                        <label className="vp-label">장소</label>
                        <AddressSelector
                            kakaoAppKey={KAKAO_JS_API_KEY}
                            basePath={`/api/vendors/${vendorId}/popups`}
                            token={token}
                            value={{
                                city,
                                district,
                                detail: form.address_detail,
                                latitude: form.latitude,
                                longitude: form.longitude,
                            }}
                            onChange={handleAddrChange}
                            showCoords={false}
                            geocodeInline
                        />
                    </div>

                    {/* 운영 시간 */}
                    <div className="vp-field">
                        <label className="vp-label">운영 시간</label>
                        <div className="vp-days">
                            {DAYS.map((d) => (
                                <Button
                                    key={d.value}
                                    variant="filter"
                                    color="red"
                                    selected={openDays.has(d.value)}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setOpenDays(prev => {
                                            const s = new Set(prev);
                                            s.has(d.value) ? s.delete(d.value) : s.add(d.value);
                                            return s;
                                        });
                                    }}
                                >
                                    {d.label}
                                </Button>
                            ))}
                        </div>

                        <div className="vp-time-row">
                            <input type="time" className="vp-input" value={startTime}
                                   onChange={(e) => setStartTime(e.target.value)}/>
                            <span className="vp-tilde">~</span>
                            <input type="time" className="vp-input" value={endTime}
                                   onChange={(e) => setEndTime(e.target.value)}/>
                        </div>
                    </div>

                    {/* 가격 */}
                    <div className="vp-field">
                        <label className="vp-label">가격(원)</label>
                        <input
                            className="vp-input"
                            inputMode="decimal"
                            placeholder="예) 10000"
                            value={form.price ?? ""}
                            onChange={(e) => update("price", e.target.value.replace(/[^\d.]/g, ""))}
                        />
                    </div>

                    {/* 팝업 소개 */}
                    <div className="vp-field">
                        <label className="vp-label">팝업 소개</label>
                        <textarea
                            className="vp-textarea"
                            rows={8}
                            value={form.description ?? ""}
                            onChange={(e) => update("description", e.target.value)}
                            placeholder="간단한 소개를 입력하세요"
                        />
                    </div>

                    {/* 버튼 */}
                    <div className="vp-actions">
                        <Button type="submit" variant="primary" color="red">
                            {isEdit ? "수정" : "등록"}
                        </Button>

                        {isEdit ? (
                            <>
                                <Button type="button" variant="outline" color="gray" onClick={handleDeletePopup}>
                                    삭제
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    color="gray"
                                    onClick={() => navigate(`/vendor/${vendorId}/popups`, {replace: true})}
                                >
                                    팝업 목록
                                </Button>
                            </>
                        ) : (
                            <Button
                                type="button"
                                variant="outline"
                                color="gray"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    navigate(`/vendor/${vendorId}/popups`, {replace: true});
                                }}
                            >
                                취소
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
