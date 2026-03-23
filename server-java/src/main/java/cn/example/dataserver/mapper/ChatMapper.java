package cn.example.dataserver.mapper;

import cn.example.dataserver.dto.ConversationListRow;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.ibatis.annotations.Param;

/**
 * 聊天相关自定义查询
 */
public interface ChatMapper {

    /**
     * 分页查询当前用户的会话列表（含对方信息、最后一条消息、未读数）
     */
    IPage<ConversationListRow> selectConversationPage(Page<ConversationListRow> page, @Param("userId") String userId);
}
