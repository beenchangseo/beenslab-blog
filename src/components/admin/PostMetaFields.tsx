'use client';

import {GetSeriesResponseDto} from '@/types/blog';

// 작성/수정 에디터가 공유하는 부가 입력. 두 페이지가 이미 많이 겹쳐 있어서
// 새로 붙는 필드만이라도 한 곳에 모은다.
type Props = {
    coverImage: string;
    setCoverImage: (value: string) => void;
    seriesId: string;
    setSeriesId: (value: string) => void;
    seriesOrder: string;
    setSeriesOrder: (value: string) => void;
    seriesList: GetSeriesResponseDto[];
};

const inputClass =
    'w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800';

export default function PostMetaFields({
    coverImage,
    setCoverImage,
    seriesId,
    setSeriesId,
    seriesOrder,
    setSeriesOrder,
    seriesList,
}: Props) {
    return (
        <>
            <div className="mb-4">
                <label className="block text-xl font-semibold mb-2" htmlFor="cover-image">
                    커버 이미지
                </label>
                <input
                    id="cover-image"
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className={inputClass}
                    placeholder="/images/example/cover.png (비워두면 자동 생성 이미지를 쓴다)"
                />
            </div>

            <div className="mb-4 grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-4">
                <div>
                    <label className="block text-xl font-semibold mb-2" htmlFor="series">
                        시리즈
                    </label>
                    <select
                        id="series"
                        value={seriesId}
                        onChange={(e) => setSeriesId(e.target.value)}
                        className={inputClass}
                    >
                        <option value="">없음</option>
                        {seriesList.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.title}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xl font-semibold mb-2" htmlFor="series-order">
                        순서
                    </label>
                    <input
                        id="series-order"
                        type="number"
                        min={1}
                        value={seriesOrder}
                        onChange={(e) => setSeriesOrder(e.target.value)}
                        disabled={!seriesId}
                        className={`${inputClass} disabled:opacity-50`}
                        placeholder="1"
                    />
                </div>
            </div>
        </>
    );
}
