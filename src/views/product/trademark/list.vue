<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="showAddDialog">添加</el-button>
    <el-table :data="trademarkList" style="width: 100%;margin:20px 0" border>
      <el-table-column label="序号" type="index" width="80" aline="center"></el-table-column>
      <el-table-column prop="tmName" label="品牌名称"></el-table-column>
      <el-table-column prop="logoUrl" label="品牌LOGO">
        <template slot-scope="{ row, $index }">
          <img :src="row.logoUrl" alt style="width:100px;height:50px" />
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="{ row, $index }">
          <el-button
            type="warning"
            size="mini"
            icon="el-icon-edit"
            @click="showUpdateDialog(row)"
          >修改</el-button>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="deleteTrademark(row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      style="text-align:center"
      @size-change="handleSizeChange"
      @current-change="getTrademarkList"
      :current-page="page"
      :page-sizes="[3, 5, 10, 15]"
      :page-size="limit"
      layout="prev, pager, next, jumper,->,sizes,total"
      :total="total"
    ></el-pagination>

    <el-dialog :title="`${form.id ? '修改':'添加'}品牌`" :visible.sync="dialogFormVisible">
      <el-form :model="form" style="width:80%">
        <el-form-item label="品牌名称" :label-width="'100px'">
          <el-input v-model="form.tmName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" :label-width="'100px'">
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="form.logoUrl" :src="form.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Trademark",
  data() {
    return {
      page: 1,
      limit: 3,
      trademarkList: [],
      total: 0,
      dialogFormVisible: false,
      imageUrl: "",
      form: {
        tmName: "",
        logoUrl: "",
      },
    };
  },
  mounted() {
    this.getTrademarkList();
  },
  methods: {
    async getTrademarkList(page = 1) {
      this.page = page;
      const result = await this.$API.trademark.getPageList(
        this.page,
        this.limit
      );
      if (result.code === 200) {
        this.trademarkList = result.data.records;
        this.total = result.data.total;
      }
    },
    // 点击添加按钮，弹出对话框
    /*
      点击取消之后，再次点击添加上次输入的数据仍然还在，
      解决，再点击添加之前就先清空数据
    */
    showAddDialog() {
      this.dialogFormVisible = true;
      this.form = {
        tmName: "",
        logoUrl: "",
      };
    },
    //  一页显示多少条
    handleSizeChange(size) {
      this.limit = size;
      this.getTrademarkList();
    },

    //  上传图片格式修改
    beforeAvatarUpload(file) {
      let fileTypes = ["image/jpeg", "image/jpg", "image/png"];
      const isJPG = fileTypes.indexOf(file.type) !== -1;
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error("上传头像图片只能是 JPG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },

    //上传成功后的处理
    handleAvatarSuccess(res, file) {
      this.form.logoUrl = res.data; //真正的收集上传成功的图片路径
    },
    // 点击确认发送请求,点击添加和修改使用同一个函数
    async save() {
      // 1.获取请求所需要的数据
      let trademark = this.form;
      try {
        // 2.发请求
        const result = await this.$API.trademark.addOrUpdate(trademark);
        if (result.code === 200) {
          //  关闭弹框
          this.dialogFormVisible = false;
          // 重新发请拿列表的数据
          this.getTrademarkList();
          //  提示添加成功
          this.$message.success(`${trademark.id ? '修改':'添加'}成功`);
        } else {
          this.$message.error(`${trademark.id ? '修改':'添加'}成功`);
        }
      } catch (error) {
        this.$message.error(error.message);
      }
    },
    //  点击修改,row就是修改的数据，将它给form表单
    showUpdateDialog(row) {
      //  弹出弹框
      this.dialogFormVisible = true;
      //  this.form =  row
      //  写row这个对象会直接影响页面，所以将row进行浅复制，和row不是同一个对象
      this.form = { ...row };
    },
    //  点击删除
    deleteTrademark(row) {
      this.$confirm(`确认删除${row.tmName}这个品牌吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async() => {
            const result = await this.$API.trademark.delete(row.id)
            if(result.code === 200){
                this.$message.success("删除成功")
                this.getTrademarkList(this.trademarkList.length > 1 ? this.page:this.page-1);
            }else{
              this.$message.error("删除失败");
            }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
  },
};
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
