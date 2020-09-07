<template>
  <div>
    <el-card>
      <CategorySelector @changeCategory="changeCategory" :isShowList="isShowList" />
    </el-card>
    <el-card style="margin:20px 0">
      <div v-show="isShowList">
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!category3Id"
          @click="showAddDiv"
        >添加</el-button>
        <el-table :data="attrList" border style="width: 100%">
          <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
          <el-table-column label="属性名称" width="150" prop="attrName"></el-table-column>

          <el-table-column label="属性值列表" width="width">
            <template slot-scope="{ row, $index }">
              <el-tag
                type="success"
                v-for="attrValue in row.attrValueList"
                :key="attrValue.id"
              >{{ attrValue.valueName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="{ row, $index }">
              <HintButton type="warning" title="修改" icon="el-icon-edit" @click="showUpdateDiv(row)"></HintButton>

              <el-popconfirm title="确定删除这条信息吗？" @onConfirm="deleteAttr(row)">
                 <HintButton slot="reference" type="danger" title="删除" icon="el-icon-delete" ></HintButton>
              </el-popconfirm>
             
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-show="!isShowList">
        <el-form ref="form" :model="form" :inline="true">
          <el-form-item label="属性名称">
            <el-input v-model="form.attrName" placeholder="请输入属性名"></el-input>
          </el-form-item>
        </el-form>
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!form.attrName"
          @click="addAttrValue"
        >添加属性值</el-button>
        <el-button @click="isShowList = true">取消</el-button>
        <el-table border style="width: 100%;margin:20px 0" :data="form.attrValueList">
          <el-table-column align="center" type="index" label="序号" width="80"></el-table-column>
          <el-table-column prop="valueName" label="属性值名称" width="width">
            <template slot-scope="{ row, $index }">
              <el-input
                :ref="$index"
                v-if="row.isEdit"
                v-model="row.valueName"
                placeholder="请输入属性值"
                size="mini"
                @blur="toLook(row)"
                @keyup.enter.native="toLook(row)"
              ></el-input>
              <span
                v-else
                @click="toEdit(row, $index)"
                style="display:inline-block;height:100%;width:100%"
              >{{ row.valueName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="width">
            <template slot-scope="{ row, $index }">
              <el-popconfirm title="确认要删除这条属性值吗？" @onConfirm="form.attrValueList.splice($index, 1)">
                <HintButton
                  slot="reference"
                  icon="el-icon-delete"
                  type="danger"
                  size="mini"
                  title="删除属性值"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" @click="save" :disabled="form.attrValueList.length ===0">保存</el-button>
        <el-button @click="isShowList = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";
export default {
  name: "Attr",
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      attrList: [],
      isShowList: true,
      form: {
        attrName: "",
        attrValueList: [],
        categoryId: "",
        categoryLevel: 3,
      },
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
        this.getAttrList();
      }
    },
    async getAttrList() {
      const { category1Id, category2Id, category3Id } = this;

      const result = await this.$API.attr.getList(
        category1Id,
        category2Id,
        category3Id
      );
      if (result.code === 200) {
        this.attrList = result.data;
      }
    },
    showAddDiv() {
      this.isShowList = false;
      //解决添加之后取消，完啦再添加数据依然存在的bug
      this.form = {
        attrName: "",
        attrValueList: [],
        categoryId: this.category3Id,
        categoryLevel: 3,
      };
    },
    addAttrValue() {
      this.form.attrValueList.push({
        attrId: this.form.id, //form当中有id就拿form的id  没有就是undefined
        valueName: "",
        //添加一个标识，用来切换是编辑模式还是查看模式
        isEdit: true,
      });

      // 给添加的元素获取焦点，永远是给最后添加的一个获取
      this.$nextTick(() => {
        this.$refs[this.form.attrValueList.length - 1].focus();
      });
    },
    showUpdateDiv(row) {
      this.isShowList = false;
      this.form = cloneDeep(row);
      //  修改属性时，每个属性也要添加一个标识
      this.form.attrValueList.forEach((item) => {
        // item.isEdit = false 错的，因为item不是响应式数据
        this.$set(item, "isEdit", false);
      });
    },
    //  点击span后改变状态为编辑模式
    toEdit(row, index) {
      row.isEdit = true;
      //  点击时，让目前所对应的input框获取焦点
      this.$nextTick(() => {
        this.$refs[index].focus();
      });
    },
    //  当input框失去焦点或者回车后改变模式为查看模式
    toLook(row) {
      //  不能有空格
      if (row.valueName.trim() === "") {
        this.$message.warning("属性值必须有值");
        // 清空一下数据
        row.valueName = "";
        return;
      }
      // 输入的值不能和已有的值一样
      let repeat = this.form.attrValueList.some((item) => {
        if (item !== row) {
          return item.valueName.trim() === row.valueName.trim();
        }
      });
      // 如果repeat为ture，证明有一样的值
      if (repeat) {
        this.$message.warning("属性值不能重复");
        return;
      }
      row.isEdit = false;
    },
    // 保存
    async save() {
      //  获取参数
      let attr = this.form;

      // 对参数进行过滤,因为在参数里面，我们新添加了一个参数isEdit,并且当它为空时，没有值时是不能不保存的
      attr.attrValueList = attr.attrValueList.filter(item =>{
        /*进行判断，如果不等于空串就证明有值，如果有值就要删除之前添加的那个属性，然后return一个ture，
          return一个ture,就相当于是在attr.attrValueList产生的新数组中添加了符合条件的那项
        */
        if(item.valueName !== ""){
            delete item.isEdit
            return true
        }
      })

      //  需要判断属性当中属性值列表有没有属性值对象，如果没有就不需要发请求
      if (attr.attrValueList.length === 0) {
        this.$message.warning("属性当中必须有属性值");
        return;
      }

      //  发送请求
      const result = await this.$API.attr.addOrUpdate(attr);
      if (result.code === 200) {
        this.$message.success("保存属性成功");
        this.isShowList = true
        this.getAttrList();
      } else {
        this.$message.error();
        ("保存属性失败");
      }
    },
    //  第一个页面的删除实现
   async deleteAttr(row){
      const result = await this.$API.attr.delete(row.id)
      if(result.code===200){
        this.$message.success("删除成功")
        this.getAttrList()
      }else{
        this.$message.warning("删除失败")
      }
    }
  },
};
</script>
