<template>
  <div>
    <el-form
      :model="form"
      label-width="100px"
      class="demo-ruleForm"
      :inline="true"
      :disabled="!isShowList"
    >
      <el-form-item label="一级分类">
        <el-select
          v-model="form.category1Id"
          placeholder="请选择"
          @change="handlerCategory1"
        >
          <el-option
            :label="c1.name"
            :value="c1.id"
            v-for="c1 in category1List"
            :key="c1.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="二级分类">
        <el-select
          v-model="form.category2Id"
          placeholder="请选择"
          @change="handlerCategory2"
        >
          <el-option
            :label="c2.name"
            :value="c2.id"
            v-for="c2 in category2List"
            :key="c2.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="三级分类">
        <el-select
          v-model="form.category3Id"
          placeholder="请选择"
          @change="handlerCategory3"
        >
          <el-option
            :label="c3.name"
            :value="c3.id"
            v-for="c3 in category3List"
            :key="c3.id"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "CategorySelector",
  props:["isShowList"],
  data() {
    return {
      form: {
        category1Id: "",
        category2Id: "",
        category3Id: ""
      },
      category1List: [],
      category2List: [],
      category3List: []
    };
  },
  mounted() {
    this.getCategory1List();
  },
  methods: {
    //  请求一二三级数据
    async getCategory1List() {
      const result = await this.$API.category.getCategorys1();
      if (result.code === 200) {
        this.category1List = result.data;
      }
    },
    async handlerCategory1(category1Id) {
      //  当修改一级数据时，二三级列表应该清空数据
      this.form.category2Id = "";
      this.form.category3Id = "";
      this.category2List = [];
      this.category3List = [];
      //  通知父组件清空数据
      this.$emit("changeCategory", { categoryId: category1Id, level: 1 });
      const result = await this.$API.category.getCategorys2(category1Id);
      if (result.code === 200) {
        this.category2List = result.data;
      }
    },
    async handlerCategory2(category2Id) {
      this.form.category3Id = "";
      this.category3List = [];
      //  通知父组件清空数据
      this.$emit("changeCategory", { categoryId: category2Id, level: 2 });
      const result = await this.$API.category.getCategorys3(category2Id);
      if (result.code === 200) {
        this.category3List = result.data;
      }
    },
    //  通知父组件请求数据
    handlerCategory3(category3Id) {
      this.$emit("changeCategory", { categoryId: category3Id, level: 3 });
    }
  }
};
</script>

<style lang="less" scoped></style>
