<template>
  <div>
    <el-card>
      <CategorySelector
        @changeCategory="changeCategory"
        :isShowList="isShowList"
      />
    </el-card>
    <el-card style="margin:20px 0">
      <div v-show="!isShowSpuForm && !isShowSkuForm">
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="showAddSpuForm"
          :disabled="!category3Id"
          >添加SPU</el-button
        >
        <el-table :data="spuList" border style="width: 100%">
          <el-table-column
            type="index"
            label="序号"
            width="80"
            align="center"
          ></el-table-column>
          <el-table-column label="SPU名称" prop="spuName"></el-table-column>
          <el-table-column label="SPU描述" prop="description"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{ row, $index }">
              <HintButton
                type="primary"
                title="添加sku"
                icon="el-icon-plus"
                size="mini"
                @click="showAddSkuForm(row)"
              ></HintButton>
              <HintButton
                type="warning"
                title="修改spu"
                icon="el-icon-edit"
                size="mini"
                @click="showUpdateSpuForm(row)"
              ></HintButton>
              <HintButton
                type="info"
                title="查看spu里的所有sku"
                icon="el-icon-info"
                size="mini"
                @click="showDialog(row)"
              ></HintButton>
              <HintButton
                type="danger"
                title="删除"
                icon="el-icon-delete"
                size="mini"
                @click="deleteSpu(row)"
              ></HintButton>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          style="text-align:center"
          @size-change="handleSizeChange"
          @current-change="getSpuList"
          :current-page="page"
          :page-sizes="[3, 5, 7, 10]"
          :page-size="limit"
          layout="prev, pager, next, jumper,->,sizes,total"
          :total="total"
        ></el-pagination>
      </div>
      <SpuForm
        v-show="isShowSpuForm"
        :visible.sync="isShowSpuForm"
        ref="spu"
        @saveSuccess="saveSuccess"
      />
      <!-- <SpuForm v-show="isShowSpuForm"  @update:visible="isShowSpuForm = $event"/> -->
      <SkuForm v-show="isShowSkuForm" :visible.sync="isShowSkuForm" ref="sku" />
    </el-card>
    <!-- 弹出一个对话框，里面展示sku的数据 -->
    <el-dialog
      title="查看sku"
      :visible.sync="isShowDialog"
      :before-close="handleBeforeClose"
    >
      <el-table :data="skuList" v-loading="loading">
        <el-table-column prop="skuName" label="名称"></el-table-column>
        <el-table-column prop="price" label="价格"></el-table-column>
        <el-table-column prop="weight" label="重量"></el-table-column>
        <el-table-column label="默认图片">
          <template slot-scope="{ row, $index }">
            <img :src="row.skuDefaultImg" alt style="width:100px;height:80px" />
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import SkuForm from "@/views/product/components/SkuForm";
import SpuForm from "@/views/product/components/SpuForm";

export default {
  name: "Spu",
  components: {
    SkuForm,
    SpuForm
  },
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      skuList: [],
      loading: true,
      isShowDialog: false,
      spuList: [],
      page: 1,
      limit: 3,
      total: 0,
      //  这个只是控制三级列表可不可用
      isShowList: true,
      //  定义两个变量来控制组件显示与否,默认都是不显示的
      isShowSpuForm: false,
      isShowSkuForm: false
    };
  },
  methods: {
    changeCategory({ categoryId, level }) {
      if (level === 1) {
        this.category1Id = categoryId;
        //  当1级列表改变，应清空2,3列表的id和清空数据
        this.category2Id = "";
        this.category3Id = "";
        this.attrList = [];
      } else if (level === 2) {
        this.category2Id = categoryId;
        // 修改2级列表的时候，要清空3级列表的id和清空数据
        this.category3Id = "";
        this.attrList = [];
      } else {
        this.category3Id = categoryId;
        //  发请求拿去数据
        this.getSpuList();
      }
    },
    //  获取数据
    async getSpuList(pagee = 1) {
      this.page = pagee;
      const { page, limit, category3Id } = this;
      const result = await this.$API.spu.getList(page, limit, category3Id);
      if (result.code === 200) {
        this.spuList = result.data.records;
        this.total = result.data.total;
      }
    },
    // 点击一页显示多少条
    handleSizeChange(val) {
      this.limit = val;
      this.getSpuList();
    },
    //  点击添加spu时，切换到spu页面
    showAddSpuForm() {
      this.isShowSpuForm = true;
      //  通知子组件发送请求获取数据
      this.$refs.spu.initAddSpuData(this.category3Id);
    },
    //  点击修改spu时，也要显示spu页面
    showUpdateSpuForm(row) {
      //最后为了判断是添加成功回来还是修改成功回来所添加的判断依据
      this.spuId = row.id;
      this.isShowSpuForm = true;
      //  通知子组件发送请求获取数据
      this.$refs.spu.initUpdateSpuData(row);
    },
    //  点击添加sku按钮时，要切换到sku页面，并通知发送请求
    showAddSkuForm(row) {
      this.isShowSkuForm = true;
      this.$refs.sku.initAddSkuData(row, this.category1Id, this.category2Id);
    },
    /*
        点击保存后返回到列表页，需要判断是修改之后回来的还是添加回来的，
         如果是修改回来，那就留在当前页,如果是添加回来，那就去第一页，都要重新获取数据
     */
    saveSuccess() {
      if (this.spuId) {
        this.getSpuList(this.page);
      } else {
        this.getSpuList();
      }
      //添加成功或者修改成功保存ok后把判断标识置为null，后期如果重新点击从新开始
      this.spuId = null;
    },
    //  点击查看spu里的sku
    async showDialog(row) {
      //  添加一个标识默认为true，用来切换显示dialog对话框
      this.isShowDialog = true;
      //  发请求拿数据展示
      const result = await this.$API.sku.getListBySpuId(row.id);
      if (result.code === 200) {
        this.skuList = result.data;
      } else {
        this.$message.error("获取数据失败");
      }
      // 关闭加载
      this.loading = false;
    },
    // 在关闭dialog之前
    handleBeforeClose() {
      //  重新设置loading,清空里面的数据，然后关闭dialog
      this.loading = true;
      this.skuInfo = [];
      this.isShowDialog = false;
    },

    //  点击删除，删除spu
    async deleteSpu(row) {
      const result = await this.$API.spu.remove(row.id);
      if (result.code === 200) {
        this.$message.success("删除成功");
        this.getSpuList(this.spuList.length > 1 ? this.page : this.page - 1);
      } else {
        this.$message.error("删除失败");
      }
    }
  },
  watch: {
    //  监视两个组件，如果切换到它们了，isShowSpuForm的值就会发生改变，val就是接收到的改变的值
    isShowSpuForm(val) {
      this.isShowList = !val;
    },
    isShowSkuForm(val) {
      this.isShowList = !val;
    }
  }
};
</script>
