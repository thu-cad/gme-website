window.GME_CONCEPT_CASES = {
  "boolean": {
    "n": "001",
    "code": "ENGINEERING / MULTI-HOLE FLANGE",
    "title": "多孔法兰与加强筋结构",
    "description": "将环形底座、阶梯轴套、两组螺栓孔与周向加强筋组织成一个工程零件。比单次布尔运算更进一步，观察多种结构在同一模型中的空间关系。",
    "points": [
      "12 个底座安装孔与 8 个上法兰连接孔",
      "贯穿内孔、阶梯轴套与双层法兰",
      "8 道径向加强筋连接轴套与底座"
    ],
    "alt": "GME Studio 多孔法兰参考结果"
  },
  "sweep": {
    "n": "002",
    "code": "ENGINEERING / BRANCH MANIFOLD",
    "title": "多分支歧管与法兰连接",
    "description": "以主管、三条弯曲支路和端部法兰表达管路系统。转动视角观察各分支的走向、连接位置及支架布局。",
    "points": [
      "连续主管与三条空间弯曲支路",
      "主管两端与支路出口的孔阵法兰",
      "支承脚座与分支间距的空间布局"
    ],
    "alt": "GME Studio 三通管参考结果"
  },
  "skinning": {
    "n": "003",
    "code": "ENGINEERING / FREEFORM IMPELLER",
    "title": "十一叶片自由曲面叶轮",
    "description": "通过沿半径变化的扭转与高度构造弯曲叶片，再沿轮毂周向阵列。适合观察自由曲面、重复结构和轮毂之间的关系。",
    "points": [
      "11 片沿径向扭转的曲面叶片",
      "逐渐变化的叶片高度与通道宽度",
      "带中心轴孔的轮毂和底盘"
    ],
    "alt": "自由曲面叶轮三维示意",
    "reference": false
  },
  "fillet": {
    "n": "004",
    "code": "ENGINEERING / BEARING HOUSING",
    "title": "带筋轴承座与连接结构",
    "description": "轴承座同时涉及环形支承、安装底板、加强筋和紧固件布局。旋转模型，检查中心通孔、前盖与底座之间的装配关系。",
    "points": [
      "中心轴承孔与环形前盖",
      "四孔安装底板、双侧支承与加强筋",
      "环向布置的 8 个六角紧固件"
    ],
    "alt": "GME Studio 复杂轴承盖参考结果"
  },
  "shell": {
    "n": "005",
    "code": "ENGINEERING / RIBBED ENCLOSURE",
    "title": "带筋薄壁壳体与安装结构",
    "description": "以开口设备壳体为主题，将薄壁、底板、内部隔筋、空心安装柱和外部连接耳组合展示。旋转模型，从内部和底部观察结构关系。",
    "points": [
      "四个空心安装柱与四个带孔连接耳",
      "三道横向隔筋与一道纵向连接筋",
      "连续外壁、薄底板及内部多分区结构"
    ],
    "alt": "GME Studio 抽壳基础参考结果"
  },
  "intersection": {
    "n": "006",
    "code": "INTERSECTION / SPLINE × CYLINDERS",
    "title": "样条曲面与圆柱面的空间交线",
    "description": "一张双三次 Bézier 样条面与两张圆柱面相交。蓝色曲面的起伏使交线沿高度变化，金色闭合曲线展示交线同时位于两类曲面上的空间关系。",
    "points": [
      "双三次样条曲面，参数网格展示曲面起伏",
      "两个圆柱穿过不同曲率区域，形成两条空间交线",
      "金色交线按曲面参数计算并采样显示，可旋转观察"
    ],
    "alt": "GME Studio 圆柱面与样条面求交参考结果"
  },
  "defeature": {
    "n": "007",
    "code": "ENGINEERING / SELECTIVE FEATURE REMOVAL",
    "title": "复杂零件的局部特征去除对比",
    "description": "左右对照同一零件的细节版与简化版。保留四个主安装孔和中心轴套通孔，移除小孔、凸台与加强筋，观察简化范围。",
    "points": [
      "左侧包含六个小孔、两个凸台与两道加强筋",
      "金色区域标示本次去除的细节与小孔边界",
      "右侧保留底板、轴套和主要安装接口"
    ],
    "alt": "选择性特征去除工程示意",
    "reference": false
  },
  "gear": {
    "n": "008",
    "code": "ENGINEERING / PATTERNED GEAR",
    "title": "孔阵列齿轮与阶梯轮毂",
    "description": "组合周向齿形、减重孔和阶梯轮毂，观察轮廓拉伸与重复特征构成的机械结构。齿形采用展示用简化轮廓。",
    "points": [
      "28 个周向齿形与 8 个减重孔",
      "贯穿轴孔、阶梯轮毂与边缘倒角",
      "旋转查看齿廓、盘体厚度和轮毂连接"
    ],
    "alt": "GME Studio 齿轮参考结果"
  },
  "offsetSurface": {
    "n": "009",
    "code": "GEOMETRY / NORMAL SURFACE OFFSET",
    "title": "起伏曲面的法向偏移",
    "description": "蓝色为原始曲面，绿色为沿单位法向生成的偏移曲面。金色箭头连接对应采样点，直观展示偏移方向随曲率变化。",
    "points": [
      "两张对应的起伏曲面与固定偏移距离",
      "九组法向箭头展示局部偏移方向",
      "侧向观察曲面间距与边界变化"
    ],
    "alt": "自由曲面法向偏移示意",
    "reference": false
  },
  "transition": {
    "n": "010",
    "code": "ENGINEERING / MULTI-SECTION TRANSITION",
    "title": "偏心方圆过渡管",
    "description": "将圆角矩形入口逐步过渡到偏心圆形出口，形成连续变化的管壁。截面轮廓同时发生形状与位置变化，顶部配置带孔连接法兰。",
    "points": [
      "圆角矩形到圆形的连续截面变化",
      "偏心出口与弯曲过渡壁面",
      "六条截面参考线及八孔顶部法兰"
    ],
    "alt": "多截面方圆过渡管示意",
    "reference": false
  }
};
