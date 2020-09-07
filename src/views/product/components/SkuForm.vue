<template>
  <div>
    <el-form label-width="100px" :model="skuInfo">
      <el-form-item label="spu名称">{{spu.spuName}}</el-form-item>

      <el-form-item label="sku名称">
        <el-input placeholder="sku名称" v-model="skuInfo.skuName"></el-input>
      </el-form-item>

      <el-form-item label="价格(元)">
        <el-input placeholder="sku价格" type="number" v-model="skuInfo.price"></el-input>
      </el-form-item>

      <el-form-item label="重量(千克)">
        <el-input placeholder="sku重量" type="number" v-model="skuInfo.weight"></el-input>
      </el-form-item>

      <el-form-item label="规格描述">
        <el-input placeholder="sku规格描述" type="textarea" rows="4" v-model="skuInfo.skuDesc"></el-input>
      </el-form-item>

      <el-form-item label="平台属性">
        <el-form :inline="true" label-width="100px">
          <el-form-item
            :label="attrInfo.attrName"
            v-for="attrInfo in attrInfoList"
            :key="attrInfo.id"
          >
            <el-select placeholder="请输入" v-model="attrInfo.attrIdAttrValueId">
              <el-option
                v-for="attrValue in attrInfo.attrValueList"
                :key="attrValue.id"
                :label="attrValue.valueName"
                :value="`${attrInfo.id}:${attrValue.id}`"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>

      <el-form-item label="销售属性">
        <el-form :inline="true" label-width="100px">
          <el-form-item
            :label="spuSaleAttr.saleAttrName"
            v-for="spuSaleAttr in spuSaleAttrList"
            :key="spuSaleAttr.id"
          >
            <el-select placeholder="请输入" v-model="spuSaleAttr.saleAttrValueId">
              <el-option
                :label="spuSaleAttrValue.saleAttrValueName"
                :value="spuSaleAttrValue.id"
                v-for="spuSaleAttrValue in spuSaleAttr.spuSaleAttrValueList"
                :key="spuSaleAttrValue.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>

      <el-form-item label="图片列表">
        <el-table border :data="spuImageList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column label="图片" width="width">
            <template slot-scope="{row,$index}">
              <img :src="row.imgUrl" alt style="width:80px;height:100px" />
            </template>
          </el-table-column>
          <el-table-column prop="imgName" label="名称" width="width"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{row,$index}">
              <el-button
                v-if="row.isDefault === 0 "
                type="primary"
                size="mini"
                @click="setDefault(row)"
              >设为默认</el-button>
              <el-tag type="success" v-else>默认</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="back">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "SkuForm",
  data() {
    return {
      spu: {},
      attrInfoList: [],
      spuSaleAttrList: [],
      spuImageList: [],
      imgList: [],

      skuInfo: {
        //第一大类：父组件传过来的
        category3Id: 0,
        spuId: 0,
        tmId: 0,
        //第二大类： v-model直接收集的
        price: 0,
        skuDesc: "",
        skuName: "",
        weight: "",
        //第三大类： 我们需要自己整理的
        skuDefaultImg: "",
        skuAttrValueList: [],
        skuImageList: [],
        skuSaleAttrValueList: [],
      },
    };
  },
  methods: {
    // 发请求获取数据
    async initAddSkuData(spu, category1Id, category2Id) {
      //  将参数保存起来
      this.spu = spu;
      this.skuInfo.category3Id = spu.category3Id;
      this.skuInfo.tmId = spu.tmId;
      this.skuInfo.spuId = spu.id;

      const promise1 = this.$API.attr.getList(
        category1Id,
        category2Id,
        spu.category3Id
      );

      const promise2 = this.$API.sku.getSpuSaleAttrList(spu.id);
      const promise3 = this.$API.sku.getSpuImageList(spu.id);

      const result = await Promise.all([promise1, promise2, promise3]);
      this.attrInfoList = result[0].data;
      this.spuSaleAttrList = result[1].data;
      //  在获取到图片的时候，给每个图片添加标识，默认为0，
      let spuImageList = result[2].data;

      this.spuImageList = spuImageList.map(
        (item) => (item = { ...item, isDefault: 0 })
      );
      //  spuImageList.forEach((item) => (item.isDefault = 0));
      // this.spuImageList = spuImageList;
    },
    // 获取点击的图片
    handleSelectionChange(val) {
      this.imgList = val;
    },
    //  将图片设为默认图片,并将图片地址存进数据里面
    setDefault(row) {
      //  给所有图片添加默认值，初始为0，点击设为默认的那个变成一
      this.spuImageList.forEach((item) => (item.isDefault = 0));
      row.isDefault = 1;
      this.skuInfo.skuDefaultImg = row.imgUrl;
    },
    // 保存
    async save() {
      //  获取参数
      let { attrInfoList, spuSaleAttrList, imgList, skuInfo } = this;
      //  整理参数
      skuInfo.skuImageList = imgList.map((item) => {
        return {
          imgName: item.imgName,
          imgUrl: item.imgUrl,
          spuImgId: item.id,
          isDefault: item.isDefault,
        };
      });

      attrInfoList.forEach((item) => {
        if (item.attrIdAttrValueId) {
          let [attrId, valueId] = item.attrIdAttrValueId.split(":");
          skuInfo.skuAttrValueList.push({
            attrId,
            valueId,
          });
        }
      });

      skuInfo.skuSaleAttrValueList = spuSaleAttrList.reduce((pre, item) => {
        if (item.saleAttrValueId) {
          pre.push({
            saleAttrValueId: item.saleAttrValueId,
          });
        }
        return pre;
      }, []);

      //  发送请求
      const result = await this.$API.sku.addUpdate(skuInfo);
      if (result.code === 200) {
        this.$message.success("保存成功");
        //  返回到列表页
        this.$emit("update:visible", false);
        //  清空数据
        this.resetData();
      } else {
        this.$message.error("保存失败");
      }
    },
    //  清空数据
    resetData() {
      (this.spu = {}),
        (this.attrInfoList = []),
        (this.spuSaleAttrList = []),
        (this.spuImageList = []),
        (this.imgList = []),
        (this.skuInfo = {
          //第一大类：父组件传过来的
          category3Id: 0,
          spuId: 0,
          tmId: 0,
          //第二大类： v-model直接收集的
          price: 0,
          skuDesc: "",
          skuName: "",
          weight: "",
          //第三大类： 我们需要自己整理的
          skuDefaultImg: "",
          skuAttrValueList: [],
          skuImageList: [],
          skuSaleAttrValueList: [],
        });
    },
    // 点击取消
    back() {
      this.$emit("update:visible", false);
      this.resetData();
    },
  },
};
</script>

<style scoped></style>
