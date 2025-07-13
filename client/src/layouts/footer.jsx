import React from 'react';
import { HeartFilled } from '@ant-design/icons';
import { Row, Col, Typography, Flex, Divider, Layout, Image } from 'antd';

const { Title, Text, Link } = Typography;

const FooterComponent = () => {
  return (
    <Layout.Footer className="print:hidden! py-12! px-0! bg-[#090D14]! flex! justify-center! w-full! mt-20!">
      <div className="w-5/6">
        <Flex vertical gap={6} className="w-full! py-12!">
          <Typography.Text className="text-white! text-lg! font-medium!">
            Về hệ thống TechShop
          </Typography.Text>
          <Typography.Text className="text-[#ffffffb2]!">
            Chúng tôi cam kết mang đến những sản phẩm và dịch vụ chất lượng cao
            nhất cho khách hàng với sự tận tâm và chuyên nghiệp.
          </Typography.Text>
        </Flex>
        <Divider className="border-gray-700! my-8!" />
        <Flex gap={12} align="start" className="w-full! py-12!">
          <Flex vertical gap={8} justify="center" className="w-1/4!">
            <Typography.Text className="text-white! uppercase! text-lg! font-medium!">
              Kết nối với TechShop
            </Typography.Text>
            <Flex gap={16} justify="start">
              <Image
                preview={false}
                className="cursor-pointer!"
                src="https://cdn2.fptshop.com.vn/svg/facebook_icon_8543190720.svg"
              />
              <Image
                preview={false}
                className="cursor-pointer!"
                src="https://cdn2.fptshop.com.vn/svg/zalo_icon_8cbef61812.svg"
              />
              <Image
                preview={false}
                className="cursor-pointer!"
                src="https://cdn2.fptshop.com.vn/svg/youtube_icon_b492d61ba5.svg"
              />
              <Image
                preview={false}
                className="cursor-pointer!"
                src="https://cdn2.fptshop.com.vn/svg/tiktok_icon_faabbeeb61.svg"
              />
            </Flex>
            <Flex vertical gap={8} className="mt-8!">
              <Typography.Text className="text-white! uppercase! text-base! font-medium!">
                Tổng đài miễn phí
              </Typography.Text>
              <Flex vertical>
                <Typography.Text className="text-white! text-base!">
                  Tư vấn mua hàng (Miễn phí)
                </Typography.Text>
                <Flex align="center" gap={4} className="cursor-pointer!">
                  <Typography.Text className="text-white! text-base! font-medium!">
                    1800.6601
                  </Typography.Text>
                  <Typography.Text className="text-white!">
                    (Nhánh 1)
                  </Typography.Text>
                </Flex>
              </Flex>
              <Flex vertical>
                <Typography.Text className="text-white! text-base!">
                  Hỗ trợ kỹ thuật
                </Typography.Text>
                <Flex align="center" gap={4} className="cursor-pointer!">
                  <Typography.Text className="text-white! text-base! font-medium!">
                    1800.6601
                  </Typography.Text>
                  <Typography.Text className="text-white!">
                    (Nhánh 2)
                  </Typography.Text>
                </Flex>
              </Flex>
              <Flex vertical>
                <Typography.Text className="text-white! text-base!">
                  Góp ý, khiếu nại
                </Typography.Text>
                <Flex align="center" gap={4} className="cursor-pointer!">
                  <Typography.Text className="text-white! text-base! font-medium!">
                    1800.6601
                  </Typography.Text>
                  <Typography.Text className="text-white!">
                    (8h00 - 22h00)
                  </Typography.Text>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
          <Flex vertical gap={8} justify="center" className="w-1/4!">
            <Typography.Text className="text-white! uppercase! text-lg! font-medium!">
              Về chúng tôi
            </Typography.Text>
            <Typography.Text className="text-white! text-base! cursor-pointer! hover:underline!">
              Giới thiệu về công ty
            </Typography.Text>
            <Typography.Text className="text-white! text-base! cursor-pointer! hover:underline!">
              Quy chế hoạt động
            </Typography.Text>
            <Typography.Text className="text-white! text-base! cursor-pointer! hover:underline!">
              Dự án doanh nghiệp
            </Typography.Text>
            <Typography.Text className="text-white! text-base! cursor-pointer! hover:underline!">
              Tin tức khuyến mại
            </Typography.Text>
            <Typography.Text className="text-white! text-base! cursor-pointer! hover:underline!">
              Giới thiệu máy đổi trả
            </Typography.Text>
            <Typography.Text className="text-white! text-base! cursor-pointer! hover:underline!">
              Hướng dẫn mua hàng & thanh toán online
            </Typography.Text>
            <Typography.Text className="text-white! text-base! cursor-pointer! hover:underline!">
              Đại lý ủy quyền và TVBH ủy quyền của Apple
            </Typography.Text>
            <Typography.Text className="text-white! text-base! cursor-pointer! hover:underline!">
              Tra cứu hóa đơn điện tử
            </Typography.Text>
            <Typography.Text className="text-white! text-base! cursor-pointer! hover:underline!">
              Tra cứu bảo hành
            </Typography.Text>
            <Typography.Text className="text-white! text-base! cursor-pointer! hover:underline!">
              Câu hỏi thường gặp
            </Typography.Text>
          </Flex>
          <Flex vertical gap={8} justify="center" className="w-1/4!">
            <Typography.Text className="text-white! uppercase! text-lg! font-medium!">
              Chính sách
            </Typography.Text>
            <Typography.Text className="text-white! text-base! cursor-pointer! hover:underline!">
              Chính sách bảo hành
            </Typography.Text>
            <Typography.Text className="text-white! text-base! cursor-pointer! hover:underline!">
              Chính sách đổi trả
            </Typography.Text>
            <Typography.Text className="text-white! text-base! cursor-pointer! hover:underline!">
              Chính sách bảo mật
            </Typography.Text>
            <Typography.Text className="text-white! text-base! cursor-pointer! hover:underline!">
              Chính sách trả góp
            </Typography.Text>
            <Typography.Text className="text-white! text-base! cursor-pointer! hover:underline!">
              Chính sách khui hộp sản phẩm
            </Typography.Text>
            <Typography.Text className="text-white! text-base! cursor-pointer! hover:underline!">
              Chính sách giao hàng & lắp đặt
            </Typography.Text>
            <Typography.Text className="text-white! text-base! cursor-pointer! hover:underline!">
              Chính sách thu thập và xử lý dữ liệu cá nhân
            </Typography.Text>
            <Typography.Text className="text-white! text-base! cursor-pointer! hover:underline!">
              Quy định về hỗ trợ kỹ thuật và sao lưu dữ liệu
            </Typography.Text>
            <Typography.Text className="text-white! text-base! cursor-pointer! hover:underline!">
              Chính sách chương trình khách hàng thân thiết
            </Typography.Text>
          </Flex>
          <Flex vertical gap={8} justify="center" className="w-1/4!">
            <Typography.Text className="text-white! uppercase! text-lg! font-medium!">
              Hỗ trợ thanh toán
            </Typography.Text>
            <Flex vertical gap={6}>
              <Flex gap={6}>
                <Image
                  preview={false}
                  src="https://cdn2.fptshop.com.vn/svg/visa_icon_44fe6e15ed.svg"
                />
                <Image
                  preview={false}
                  src="https://cdn2.fptshop.com.vn/svg/mastercard_icon_c75f94f6a5.svg"
                />
                <Image
                  preview={false}
                  src="https://cdn2.fptshop.com.vn/svg/jcb_icon_214783937c.svg"
                />
                <Image
                  preview={false}
                  src="https://cdn2.fptshop.com.vn/svg/amex_icon_d6fb68108d.svg"
                />
              </Flex>
              <Flex gap={6}>
                <Image
                  preview={false}
                  src="https://cdn2.fptshop.com.vn/svg/vnpay_icon_f42045057d.svg"
                />
                <Image
                  preview={false}
                  src="https://cdn2.fptshop.com.vn/svg/zalopay_icon_26d64ea93f.svg"
                />
                <Image
                  preview={false}
                  src="https://cdn2.fptshop.com.vn/svg/napas_icon_94d5330e3c.svg"
                />
                <Image
                  preview={false}
                  src="https://cdn2.fptshop.com.vn/svg/kredivo_icon_04f72baf36.svg"
                />
              </Flex>
              <Flex gap={6}>
                <Image
                  preview={false}
                  src="https://cdn2.fptshop.com.vn/svg/momo_icon_baef21b5f7.svg"
                />
                <Image
                  preview={false}
                  src="https://cdn2.fptshop.com.vn/svg/foxpay_icon_063b36c1f8.svg"
                />
                <Image
                  preview={false}
                  src="https://cdn2.fptshop.com.vn/svg/alepay_icon_20d5310617.svg"
                />
                <Image
                  preview={false}
                  src="https://cdn2.fptshop.com.vn/svg/muadee_icon_5e297d9e61.svg"
                />
              </Flex>
              <Flex gap={6}>
                <Image
                  preview={false}
                  src="https://cdn2.fptshop.com.vn/svg/homepaylater_icon_adef600842.svg"
                />
                <Image
                  preview={false}
                  src="https://cdn2.fptshop.com.vn/svg/homepaylater_icon_adef600842.svg"
                />
                <Image
                  preview={false}
                  src="https://cdn2.fptshop.com.vn/svg/samsungpay_icon_0292aa9876.svg"
                />
                <Image
                  preview={false}
                  src="https://cdn2.fptshop.com.vn/svg/googlepay_icon_afa293cc14.svg"
                />
              </Flex>
            </Flex>

            <Flex vertical gap={6} className="mt-10!">
              <Typography.Text className="text-white! uppercase! text-lg! font-medium!">
                Chứng nhận
              </Typography.Text>
              <Flex gap={6}>
                <Image
                  preview={false}
                  src="https://cdn2.fptshop.com.vn/svg/dmca_icon_8fc6622bd5.svg"
                />
                <Image
                  preview={false}
                  src="https://cdn2.fptshop.com.vn/svg/thuong_hieu_manh_2013_icon_b56f772475.svg"
                />
                <Image
                  preview={false}
                  src="https://cdn2.fptshop.com.vn/svg/san_pham_dich_vu_hang_dau_viet_nam_icon_282a9ba4f7.svg"
                />
              </Flex>
              <Flex gap={6}>
                <Image
                  preview={false}
                  src="https://cdn2.fptshop.com.vn/svg/noi_khong_voi_hang_gia_icon_e16037d9cb.svg"
                />
                <Image
                  preview={false}
                  src="https://cdn2.fptshop.com.vn/svg/da_thong_bao_bo_cong_thuong_icon_64785fb3f7.svg"
                />
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </div>
    </Layout.Footer>
  );
};

export default FooterComponent;
