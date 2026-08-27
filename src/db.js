// mock 数据层 —— MVP 阶段用，真实数据源接入后此文件可整体替换
// 数据结构对齐 PriceSource 接口（见 data-sources/index.js）

const DB = {
  user: {
    name: "张明", role: "采购经理", company: "深圳科创电子有限公司", avatar: "张",
    stats: { totalOrders: 128, totalSpent: 456800, savedAmount: 32400, inquiryCount: 56 }
  },
  platforms: [
    { key: "1688", name: "1688", color: "#FF6A00", logo: "1688", type: "purchase" },
    { key: "taobao", name: "淘宝", color: "#FF6A00", logo: "淘", type: "retail" },
    { key: "jd", name: "京东", color: "#E1251B", logo: "东", type: "retail" },
    { key: "pdd", name: "拼多多", color: "#E02E24", logo: "拼", type: "retail" }
  ],
  products: [
    { id: "P001", name: "304不锈钢保温杯 500ml 商务办公水杯", category: "日用品/保温杯", spec: "304不锈钢 500ml",
      image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=304%20stainless%20steel%20insulated%20water%20bottle%20500ml%20product%20photo%20white%20background&image_size=square",
      unit: "个", moq: 100,
      platforms: [
        { key: "1688", shopName: "义乌市盛达杯业工厂店", price: 8.50, originalPrice: 12.00, sold: 50000, rating: 4.8, link: "https://detail.1688.com/p001", fetchedAt: "2026-08-27 09:12" },
        { key: "taobao", shopName: "盛达官方旗舰店", price: 19.90, originalPrice: 29.90, sold: 20000, rating: 4.7, link: "https://item.taobao.com/p001", fetchedAt: "2026-08-27 09:12" },
        { key: "jd", shopName: "盛达京东自营店", price: 25.90, originalPrice: 39.90, sold: 8000, rating: 4.9, link: "https://item.jd.com/p001", fetchedAt: "2026-08-27 09:12" },
        { key: "pdd", shopName: "盛达家居拼购店", price: 15.80, originalPrice: 22.00, sold: 120000, rating: 4.6, link: "https://mobile.yangkeduo.com/p001", fetchedAt: "2026-08-27 09:12" }
      ],
      history: [8.5,8.6,8.4,8.7,9.0,9.2,8.9,8.5,8.3,8.1,8.0,8.2,8.4,8.6,8.5,8.3,8.2,8.0,7.9,8.1,8.3,8.5,8.6,8.4,8.3,8.5,8.7,8.5,8.4,8.5]
    },
    { id: "P002", name: "蓝牙耳机无线入耳式 迷你降噪 运动商务", category: "数码电子/耳机", spec: "无线降噪 入耳式",
      image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=wireless%20bluetooth%20earbuds%20mini%20noise%20canceling%20product%20photo%20white%20background&image_size=square",
      unit: "副", moq: 50,
      platforms: [
        { key: "1688", shopName: "深圳蓝声科技有限公司", price: 35.00, originalPrice: 68.00, sold: 30000, rating: 4.7, link: "https://detail.1688.com/p002", fetchedAt: "2026-08-27 09:12" },
        { key: "taobao", shopName: "蓝声数码旗舰店", price: 79.00, originalPrice: 129.00, sold: 15000, rating: 4.6, link: "https://item.taobao.com/p002", fetchedAt: "2026-08-27 09:12" },
        { key: "jd", shopName: "蓝声京东自营店", price: 99.00, originalPrice: 159.00, sold: 5000, rating: 4.8, link: "https://item.jd.com/p002", fetchedAt: "2026-08-27 09:12" },
        { key: "pdd", shopName: "蓝声百亿补贴店", price: 59.90, originalPrice: 89.00, sold: 88000, rating: 4.5, link: "https://mobile.yangkeduo.com/p002", fetchedAt: "2026-08-27 09:12" }
      ],
      history: [35,36,35.5,34.8,34.5,35,35.2,34.8,34.5,34.2,34,34.5,35,36,35.5,35,34.8,34.5,34.2,34,34.5,35,35.5,35,34.8,34.6,35,35.2,35,35]
    },
    { id: "P003", name: "广告定制中性笔 企业logo印字 办公礼品", category: "办公用品/笔", spec: "定制logo 中性笔",
      image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=customized%20ballpoint%20pen%20corporate%20logo%20product%20photo%20white%20background&image_size=square",
      unit: "支", moq: 500,
      platforms: [
        { key: "1688", shopName: "温州文采文具工厂", price: 0.85, originalPrice: 1.50, sold: 200000, rating: 4.8, link: "https://detail.1688.com/p003", fetchedAt: "2026-08-27 09:12" },
        { key: "taobao", shopName: "文采办公旗舰店", price: 2.50, originalPrice: 3.90, sold: 50000, rating: 4.7, link: "https://item.taobao.com/p003", fetchedAt: "2026-08-27 09:12" },
        { key: "jd", shopName: "文采京东办公店", price: 3.20, originalPrice: 4.50, sold: 12000, rating: 4.8, link: "https://item.jd.com/p003", fetchedAt: "2026-08-27 09:12" },
        { key: "pdd", shopName: "文采拼购工厂店", price: 1.80, originalPrice: 2.50, sold: 180000, rating: 4.5, link: "https://mobile.yangkeduo.com/p003", fetchedAt: "2026-08-27 09:12" }
      ],
      history: [0.85,0.86,0.84,0.83,0.82,0.85,0.88,0.86,0.84,0.83,0.82,0.80,0.81,0.83,0.85,0.84,0.83,0.82,0.81,0.80,0.82,0.84,0.85,0.84,0.83,0.82,0.85,0.86,0.85,0.85]
    },
    { id: "P004", name: "帆布手提袋 定制印花 购物袋环保袋", category: "包装用品/袋", spec: "定制印花 帆布",
      image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=canvas%20tote%20bag%20custom%20printed%20eco%20bag%20product%20photo%20white%20background&image_size=square",
      unit: "个", moq: 200,
      platforms: [
        { key: "1688", shopName: "河北袋途包装制品厂", price: 2.20, originalPrice: 4.00, sold: 80000, rating: 4.7, link: "https://detail.1688.com/p004", fetchedAt: "2026-08-27 09:12" },
        { key: "taobao", shopName: "袋途环保旗舰店", price: 5.90, originalPrice: 9.90, sold: 30000, rating: 4.6, link: "https://item.taobao.com/p004", fetchedAt: "2026-08-27 09:12" },
        { key: "jd", shopName: "袋途京东自营店", price: 7.50, originalPrice: 12.00, sold: 8000, rating: 4.8, link: "https://item.jd.com/p004", fetchedAt: "2026-08-27 09:12" },
        { key: "pdd", shopName: "袋途拼购工厂店", price: 4.50, originalPrice: 6.90, sold: 95000, rating: 4.4, link: "https://mobile.yangkeduo.com/p004", fetchedAt: "2026-08-27 09:12" }
      ],
      history: [2.2,2.3,2.2,2.1,2.0,2.2,2.4,2.3,2.1,2.0,1.9,2.0,2.1,2.3,2.2,2.1,2.0,1.9,1.8,1.9,2.0,2.2,2.3,2.2,2.1,2.0,2.2,2.3,2.2,2.2]
    },
    { id: "P005", name: "Type-C数据线 快充6A 纯铜尼龙编织", category: "数码电子/数据线", spec: "Type-C 6A 尼龙编织",
      image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Type-C%20USB%20cable%20fast%20charging%206A%20nylon%20braided%20product%20photo%20white%20background&image_size=square",
      unit: "条", moq: 100,
      platforms: [
        { key: "1688", shopName: "深圳线通电子工厂", price: 3.50, originalPrice: 6.00, sold: 150000, rating: 4.8, link: "https://detail.1688.com/p005", fetchedAt: "2026-08-27 09:12" },
        { key: "taobao", shopName: "线通数码旗舰店", price: 9.90, originalPrice: 15.90, sold: 60000, rating: 4.7, link: "https://item.taobao.com/p005", fetchedAt: "2026-08-27 09:12" },
        { key: "jd", shopName: "线通京东自营店", price: 12.90, originalPrice: 19.90, sold: 20000, rating: 4.9, link: "https://item.jd.com/p005", fetchedAt: "2026-08-27 09:12" },
        { key: "pdd", shopName: "线通拼购工厂店", price: 6.90, originalPrice: 9.90, sold: 200000, rating: 4.5, link: "https://mobile.yangkeduo.com/p005", fetchedAt: "2026-08-27 09:12" }
      ],
      history: [3.5,3.6,3.5,3.4,3.3,3.5,3.7,3.6,3.4,3.3,3.2,3.3,3.4,3.6,3.5,3.4,3.3,3.2,3.1,3.2,3.3,3.5,3.6,3.5,3.4,3.3,3.5,3.6,3.5,3.5]
    },
    { id: "P006", name: "纸箱快递包装盒 加厚瓦楞 定制尺寸", category: "包装用品/纸箱", spec: "加厚瓦楞 定制尺寸",
      image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cardboard%20shipping%20box%20corrugated%20carton%20product%20photo%20white%20background&image_size=square",
      unit: "个", moq: 500,
      platforms: [
        { key: "1688", shopName: "东莞纸品包装工厂", price: 1.20, originalPrice: 2.00, sold: 500000, rating: 4.8, link: "https://detail.1688.com/p006", fetchedAt: "2026-08-27 09:12" },
        { key: "taobao", shopName: "纸品包装旗舰店", price: 3.50, originalPrice: 5.00, sold: 80000, rating: 4.6, link: "https://item.taobao.com/p006", fetchedAt: "2026-08-27 09:12" },
        { key: "jd", shopName: "纸品京东自营店", price: 4.20, originalPrice: 6.00, sold: 15000, rating: 4.7, link: "https://item.jd.com/p006", fetchedAt: "2026-08-27 09:12" },
        { key: "pdd", shopName: "纸品拼购工厂店", price: 2.80, originalPrice: 3.90, sold: 300000, rating: 4.4, link: "https://mobile.yangkeduo.com/p006", fetchedAt: "2026-08-27 09:12" }
      ],
      history: [1.2,1.3,1.2,1.1,1.0,1.2,1.4,1.3,1.1,1.0,0.9,1.0,1.1,1.3,1.2,1.1,1.0,0.9,0.8,0.9,1.0,1.2,1.3,1.2,1.1,1.0,1.2,1.3,1.2,1.2]
    }
  ],
  alerts: [
    { id: "AL001", productId: "P001", productName: "304不锈钢保温杯 500ml", targetPrice: 8.0, currentPrice: 8.50, status: "监控中", createdTime: "2026-08-25" },
    { id: "AL002", productId: "P005", productName: "Type-C数据线 快充6A", targetPrice: 3.2, currentPrice: 3.50, status: "已触发", createdTime: "2026-08-20" }
  ],
  recentSearches: ["304不锈钢保温杯 500ml", "蓝牙耳机降噪", "Type-C数据线 6A", "帆布手提袋 定制"],
  quickPrompts: [
    "帮我找500个不锈钢保温杯，预算每个10元以内",
    "找100副蓝牙耳机，要降噪功能",
    "采购1000支中性笔，要印logo",
    "需要200个帆布手提袋，加印花",
    "找100条Type-C快充数据线",
    "采购500个纸箱快递盒"
  ],
  chatHistory: []
};

module.exports = DB;
