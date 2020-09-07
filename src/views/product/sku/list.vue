<template>
  <div>
    <el-card>
      <el-table border v-loading="loading" :data="skuList" style="margin-botton:10px">
        <el-table-column type="index" label="序号" width="80"></el-table-column>
        <el-table-column prop="skuName" label="名称" width="180"></el-table-column>
        <el-table-column prop="skuDesc" label="描述" width="180"></el-table-column>
        <el-table-column label="默认图片" width="150">
          <template slot-scope="{ row, $index }">
            <img :src="row.skuDefaultImg" alt style="height:80px;width:100px" />
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="重量(kg)" width="180"></el-table-column>
        <el-table-column prop="price" label="价格(元)" width="80"></el-table-column>
        <el-table-column label="操作" width="250">
          <template slot-scope="{ row, $index }">
            <HintButton
              type="info"
              icon="el-icon-top"
              size="mini"
              title="上架"
              v-if="row.isSale === 1"
              @click="cancelSale(row.id)"
            />
            <HintButton
              type="success"
              icon="el-icon-bottom"
              size="mini"
              title="下架"
              v-else
              @click="onSale(row.id)"
            />
            <HintButton type="primary" icon="el-icon-edit" size="mini" title="修改" />
            <HintButton
              type="info"
              icon="el-icon-info"
              size="mini"
              title="查看详情"
              @click="showSkuInfo(row.id)"
            />
            <HintButton
              type="danger"
              icon="el-icon-delete"
              size="mini"
              title="删除"
              @click="deleteInfo(row.id)"
            />
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="getSkuList"
        :current-page="page"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="limit"
        layout=" prev, pager, next, jumper,->,sizes,total"
        :total="total"
      ></el-pagination>

      <el-drawer :visible.sync="drawer" :with-header="false" size="35%">
        <el-row>
          <el-col :span="5">名称</el-col>
          <el-col :span="16">{{skuInfo.skuName}}</el-col>
        </el-row>
        <el-row>
          <el-col :span="5">描述</el-col>
          <el-col :span="16">{{skuInfo.skuDesc}}</el-col>
        </el-row>
        <el-row>
          <el-col :span="5">价格</el-col>
          <el-col :span="16">{{skuInfo.price}}</el-col>
        </el-row>

        <el-row>
          <el-col :span="5">平台属性</el-col>
          <el-col :span="18">
            <el-tag
              type="success"
              style="margin-right: 5px"
              v-for="value in skuInfo.skuAttrValueList"
              :key="value.id"
            >{{value.attrId + '-' + value.valueId}}</el-tag>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="5">销售属性</el-col>
          <el-col :span="18">
            <el-tag
              type="success"
              style="margin-right: 5px"
              v-for="value in skuInfo.skuSaleAttrValueList"
              :key="value.id"
            >{{value.id + '-' + value.saleAttrValueId}}</el-tag>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="5">商品图片</el-col>
          <el-col :span="16">
            <el-carousel class="sku-carousel" trigger="click" height="400px">
              <el-carousel-item v-for="item in skuInfo.skuImageList" :key="item.id">
                <img :src="item.imgUrl" alt />
              </el-carousel-item>
            </el-carousel>
          </el-col>
        </el-row>
      </el-drawer>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Sku",
  data() {
    return {
      loading: true,
      page: 1,
      limit: 10,
      skuList: [],
      total: 0,
      drawer: false,
      skuInfo: {},
    };
  },
  mounted() {
    this.getSkuList();
  },
  methods: {
    //  请求数据
    async getSkuList(page = 1) {
      this.page = page;
      const result = await this.$API.sku.getList(this.page, this.limit);
      if (result.code === 200) {
        this.skuList = result.data.records;
        this.total = result.data.total;
        this.loading = false;
      }
    },
    //  一页显示多少条数据
    handleSizeChange(val) {
      this.limit = val;
      this.getSkuList();
    },
    // 上架,发送请求
    async onSale(skuId) {
      const result = await this.$API.sku.onSale(skuId);
      if (result.code === 200) {
        this.$message.success("下架成功");
        this.getSkuList(this.page);
      } else {
        this.$message.error("下架失败");
      }
    },
    //  下架请求
    async cancelSale(skuId) {
      const result = await this.$API.sku.cancelSale(skuId);
      if (result.code === 200) {
        this.$message.success("上架成功");
        this.getSkuList(this.page);
      } else {
        this.$message.error("上架失败");
      }
    },

    // 查看商品属性
    async showSkuInfo(skuId) {
      this.drawer = true;
      const result = await this.$API.sku.get(skuId);
      this.skuInfo = result.data;
    },
    //  删除
    async deleteInfo(id) {
      const result = await this.$API.sku.remove(id);
      if (result.code === 200) {
        this.$message.success("删除成功");
        this.getSkuList(1);
      } else {
        this.$message.error("删除失败");
      }
    },
  },
};
</script>

<style lang="scss" scoped>
/* 
    1. 为什么必须加/deep/才能修改Carousel组件的样式?, 
      声明了scoped, 不用deep不能修改子组件的非标签样式(也就是Carousel组件内部的子标签样式)
      用了deep: 不会对目标标签有当前组件的data属性选择的要求
    2. 为什么不加/deep/能修改Row/Col组件的样式?
      我们修改的是Row/Col根标签样式(它有当前组件的data属性)
  */
.sku-list {
  .el-row {
    height: 40px;
    .el-col {
      line-height: 40px;
      &.el-col-5 {
        font-size: 18px;
        font-weight: bold;
        text-align: right;
        margin-right: 20px;
      }
    }
  }

  .sku-carousel {
    width: 400px;
    border: 1px solid #ccc;
    img {
      width: 400px;
      height: 400px;
    }
    /deep/ .el-carousel__indicator {
      button {
        background-color: hotpink;
      }
      &.is-active {
        button {
          background-color: green;
        }
      }
    }
  }
}
</style>