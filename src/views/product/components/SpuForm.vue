<template>
  <div>
    <el-form ref="form" label-width="100px">
      <el-form-item label="SPU名称" :data="spuInfo">
        <el-input placeholder="SPU名称" v-model="spuInfo.spuName"></el-input>
      </el-form-item>

      <el-form-item label="品牌">
        <el-select placeholder="请选择品牌" v-model="spuInfo.tmId">
          <el-option
            :label="trademark.tmName"
            :value="trademark.id"
            v-for="trademark in trademarkList"
            :key="trademark.id"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="SPU描述">
        <el-input
          placeholder="SPU描述"
          type="textarea"
          rows="4"
          v-model="spuInfo.description"
        ></el-input>
      </el-form-item>

      <el-form-item label="SPU图片">
        <el-upload
          action="/dev-api/admin/product/fileUpload"
          list-type="picture-card"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :on-success="handelSusess"
          :file-list="spuImageList"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt />
        </el-dialog>
      </el-form-item>

      <el-form-item label="销售属性">
        <el-select
          :placeholder="
            unUsedBaseSaleAttrList.length > 0
              ? `还有${unUsedBaseSaleAttrList.length}个未选择`
              : '没有啦！！！'
          "
          v-model="attrIdattrName"
        >
          <el-option
            :label="unUsedBaseSaleAttr.name"
            :value="`${unUsedBaseSaleAttr.id}:${unUsedBaseSaleAttr.name}`"
            v-for="(unUsedBaseSaleAttr, index) in unUsedBaseSaleAttrList"
            :key="unUsedBaseSaleAttr.id"
          ></el-option>
        </el-select>
        <el-button icon="el-icon-plus" type="primary" @click="addSaleAttr"
          >添加销售属性</el-button
        >
        <el-table
          style="width: 100%;margin-top:20px"
          border
          :data="spuInfo.spuSaleAttrList"
        >
          <el-table-column
            label="序号"
            type="index"
            width="80"
            align="center"
          ></el-table-column>
          <el-table-column
            label="属性名"
            width="150"
            prop="saleAttrName"
          ></el-table-column>
          <el-table-column label="属性值名称列表" width="width">
            <template slot-scope="{ row, $index }">
              <el-tag
                :key="spuSaleAttrValue.id"
                v-for="(spuSaleAttrValue, index) in row.spuSaleAttrValueList"
                closable
                :disable-transitions="false"
                @close="row.spuSaleAttrValueList.splice(index, 1)"
              >
                <!--  @close="handleClose(tag)" -->
                {{ spuSaleAttrValue.saleAttrValueName }}
              </el-tag>
              <el-input
                class="input-new-tag"
                v-if="row.isEdit"
                v-model="row.saleAttrValueName"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(row)"
                @blur="handleInputConfirm(row)"
              ></el-input>
              <el-button
                v-else
                class="button-new-tag"
                size="small"
                @click="showInput(row)"
                >+ 添加属性值</el-button
              >
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="{ row, $index }">
              <el-popconfirm
                title="这是一段内容确定删除吗？"
                @onConfirm="spuInfo.spuSaleAttrList.splice($index, 1)"
              >
                <HintButton
                  slot="reference"
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  title="删除销售属性"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "SpuForm",
  data() {
    return {
      dialogImageUrl: "",
      dialogVisible: false,
      attrIdattrName: "",
      spuInfo: {
        spuName: "",
        tmId: "",
        description: "",
        spuSaleAttrList: []
      },
      spuImageList: [],
      trademarkList: [],
      baseSaleAttrList: [],
      //  收集图片的列表
      imgList: []
    };
  },
  methods: {
    //  图片被删除的时候保存剩下的图片
    handleRemove(file, fileList) {
      console.log(file, fileList);
      this.imgList = fileList;
    },
    //  图片上传成功后也要保存图片
    handelSusess(response, file, fileList) {
      this.imgList = fileList;
    },
    //  点击显示大图
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    //点击父组件当中的修改按钮，父组件需要调用这个函数让子组件发请求获取初始化展示的数据
    initUpdateSpuData(spu) {
      //保存从父组件修改传过来的某个spu 为了后面我们可以使用它内部的数据
      this.spu = spu;
      //  保存父组件传过来的category3Id，之后发请求需要用到
      this.spuInfo.category3Id = spu.category3Id;
      this.getSpuInfo(spu.id);
      this.getSpuImageList(spu.id);
      this.getTrademarkList();
      this.getBaseSaleAttrList();
    },
    // 获取对应id的spu详情
    async getSpuInfo(spuId) {
      const result = await this.$API.spu.get(spuId);
      if (result.code === 200) {
        this.spuInfo = result.data;
      } else {
        this.$message.error("请求失败");
      }
    },

    // 获取对应id的spu的图片列表
    async getSpuImageList(spuId) {
      const result = await this.$API.sku.getSpuImageList(spuId);
      if (result.code === 200) {
        let spuImageList = result.data;
        spuImageList.forEach(item => {
          item.name = item.imgName;
          item.url = item.imgUrl;
        });
        this.spuImageList = spuImageList;
      } else {
        this.$message.error("请求失败");
      }
    },
    //获取所有的品牌列表
    async getTrademarkList() {
      const result = await this.$API.trademark.getList();
      if (result.code === 200) {
        this.trademarkList = result.data;
      } else {
        this.$message.error("请求失败");
      }
    },
    // 获取所有的基础销售属性列表
    async getBaseSaleAttrList() {
      const result = await this.$API.spu.getSaleList();
      if (result.code === 200) {
        this.baseSaleAttrList = result.data;
      } else {
        this.$message.error("请求失败");
      }
    },
    //  当点击添加按钮时子组件发送的请求
    initAddSpuData(category3Id) {
      this.spuInfo.category3Id = category3Id;
      this.getTrademarkList();
      this.getBaseSaleAttrList();
    },
    // 点击添加销售属性
    addSaleAttr() {
      console.log(this);
      let [baseSaleAttrId, saleAttrName] = this.attrIdattrName.split(":");
      baseSaleAttrId *= 1;
      

      let spuId = this.spu.id;
      let spuSaleAttrValueList = [];
      let attr = {
        baseSaleAttrId,
        saleAttrName,
        spuId,
        spuSaleAttrValueList
      };
      this.spuInfo.spuSaleAttrList.push(attr);
      this.attrIdattrName = "";
    },
    //  添加属性值
    showInput(row) {
      //  将isEdit变为false
      this.$set(row, "isEdit", true);
      //  自动获取焦点
      this.$nextTick(() => {
        this.$refs.saveTagInput.focus();
      });
    },
    //  输入框失去焦点时
    handleInputConfirm(row) {
      //  先获取所有的参数，row就是spuSaleAttrList里的每个对象，所以这些值可以从row里得到
      let { saleAttrValueName, baseSaleAttrId, saleAttrName } = row;
      //  spuId在请求数据的时候父组件传过来就已经保存在data中了，也可以直接使用
      let spuId = this.spu.id;
      let attrValue = {
        saleAttrValueName,
        baseSaleAttrId,
        saleAttrName,
        spuId
      };
      //  判断输入的值是否是空串或者与原有的值一样
      if (saleAttrValueName.trim() === "") return;

      let repeat = row.spuSaleAttrValueList.some(
        item => attrValue.saleAttrValueName === item.saleAttrValueName
      );
      // 进入这里证明有重复的，那就提示一下，并清空里面的数据，然后变回查看模式
      if (repeat) {
        this.$message.error("属性值不能重复");
        row.isEdit = false;
        row.saleAttrValueName = "";
        return;
      }

      //  向spuSaleAttrValueList里添加信息
      row.spuSaleAttrValueList.push(attrValue);
      // 再让当前的这个属性的属性值变为查看模式
      row.isEdit = false;
      //  清空数据
      row.saleAttrValueName = "";
    },
    //  点击保存
    async save() {
      //  获取参数
      let { imgList, spuInfo, spu } = this;

      //  整理参数图片参数
      imgList = imgList.map(item => {
        return {
          imgName: item.imgName || item.name,
          imgUrl: item.item || item.url,
          spuId: spu.id
        };
      });
      //  发送参数的形式要求图片应该在spuInfo下，并且名字叫spuImageList，所以将处理后的参数添加进去
      spuInfo.spuImageList = imgList;
      //  清除自己添加的参数(isEdit,saleAttrValueName)
      spuInfo.spuSaleAttrList.forEach(item => {
        delete item.isEdit;
        delete item.saleAttrValueName;
      });
      // 发请求
      const result = await this.$API.spu.addUpdate(spuInfo);
      if (result.code === 200) {
        this.$message.success("保存成功");
        //  返回列表页
        this.$emit("saveSuccess");
        //  关闭spu页面
        this.$emit("update:visible", false);
      } else {
        this.$message.error("保存失败");
      }
      // 清空数据
      this.resetData();
    },
    //  保存成功后清空数据
    resetData() {
      (this.dialogImageUrl = ""),
        (this.dialogVisible = false),
        (this.attrIdattrName = ""),
        (this.spuInfo = {
          spuName: "",
          tmId: "",
          description: "",
          spuSaleAttrList: []
        }),
        (this.spuImageList = []),
        (this.trademarkList = []),
        (this.baseSaleAttrList = []),
        //  收集图片的列表
        (this.imgList = []);
    },
    //  点击取消
    cancel() {
      //  通知父组件关闭页面
      this.$emit("update:visible", false);
      //  清空数据
      this.resetData();
    }
  },
  computed: {
    unUsedBaseSaleAttrList() {
      return this.baseSaleAttrList.filter(baseSaleAttr =>
        this.spuInfo.spuSaleAttrList.every(
          spuSaleAttr => spuSaleAttr.saleAttrName !== baseSaleAttr.name
        )
      );
    }
  }
};
</script>

<style>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
