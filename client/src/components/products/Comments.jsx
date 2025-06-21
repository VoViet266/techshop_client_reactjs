import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { AiOutlineLike, AiOutlineRollback } from 'react-icons/ai';

function Comments({ className, product, loading, comment, setComment }) {
  return (
    <div className={className}>
      <div className="flex itcems-center gap-10">
        <span className="font-bold text-primary text-xl uppercase">
          {loading ? (
            <div className="w-250">
              <Skeleton className="h-30" />
            </div>
          ) : (
            'Bình luận và đánh giá'
          )}
        </span>
        <span className="flex items-center text-sm text-gray-500">
          {loading ? <Skeleton className="h-20" /> : '10 bình luận'}
        </span>
      </div>
      <div>
        {loading ? (
          <Skeleton className="h-70" />
        ) : (
          <textarea
            id=""
            name=""
            value={comment}
            placeholder="Nhập bình luận"
            onChange={(event) => setComment(event.target.value)}
            className="w-full rounded-md border-gray-300 border p-8"
          ></textarea>
        )}
        <div className="flex items-center justify-end mt-10">
          {loading ? (
            <div className="w-100 mr-10">
              <Skeleton className="h-36" />
            </div>
          ) : (
            <button className="px-8 cursor-pointer hover:opacity-80 bg-gray-200 rounded-sm py-6 min-w-100 mr-10">
              Hủy
            </button>
          )}

          {loading ? (
            <div className="w-100">
              <Skeleton className="h-36" />
            </div>
          ) : (
            <button className="px-8 cursor-pointer hover:opacity-80 bg-primary text-white rounded-sm py-6 min-w-100">
              Bình luận
            </button>
          )}
        </div>
      </div>

      {!product.comments ? (
        <Skeleton className="h-90" />
      ) : (
        <div className="flex gap-10 justify-start">
          <div className="w-40 h-40 mt-4 rounded-full">
            <img
              alt=""
              className="rounded-full"
              src="https://yt3.googleusercontent.com/F6YRXcBbkvTCIDvHrXqWfnht_stmrhSRvVVtTybO4JyBXFeyAOjMIWM-PlOq_8UTaPSGtXAyMA=s900-c-k-c0x00ffffff-no-rj"
            />
          </div>

          <div className="flex flex-col justify-center gap-6">
            <div className="flex items-center gap-12">
              <span className="font-medium">Nguyễn Văn A</span>
              <span className="text-sm flex items-center">2 phút trước</span>
            </div>
            <span>Tuyệt vời quá mấy em ơi!!!</span>
            <div className="flex items-center gap-8">
              <button className="border flex items-center gap-4 cursor-pointer min-w-80 justify-center px-8 py-4 rounded-full border-gray-300 text-sm">
                <AiOutlineLike />
                <span>Thích</span>
              </button>
              <button className="border flex items-center gap-4 cursor-pointer min-w-80 justify-center px-8 py-4 rounded-full border-gray-300 text-sm">
                <AiOutlineRollback />
                <span>Trả lời</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Comments;
