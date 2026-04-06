"""
AI 服务模块
"""
import os
from config import settings


def get_marketing_insight(prompt: str) -> str:
    """
    获取市场洞察
    
    Args:
        prompt: 提示词
        
    Returns:
        AI生成的洞察内容
    """
    # 检查是否配置了API密钥
    if not settings.GOOGLE_API_KEY:
        # 返回模拟数据
        return f"""
## 市场洞察分析

基于当前数据，以下是几点建议：

### 核心成果
- 预算执行率良好，成本控制在预期范围内
- 活动覆盖目标受众广泛，品牌曝光效果显著
- 获客成本(CPL)低于行业平均水平

### 存在不足
- 部分环节执行效率有待提升
- 客户转化漏斗中某环节流失率偏高

### 后续优化建议
1. 优化获客渠道组合
2. 加强活动后跟进机制
3. 建立更精细的预算监控体系

---
*注：当前使用模拟数据，配置 Google API Key 后将获得真实AI分析*
"""
    
    try:
        import google.generativeai as genai
        
        genai.configure(api_key=settings.GOOGLE_API_KEY)
        
        model = genai.GenerativeModel(
            model_name='gemini-pro',
            system_instruction="你是一个资深的市场经理和数据分析专家。请用专业、简洁、有建设性的中文回答。"
        )
        
        response = model.generate_content(prompt)
        return response.text
        
    except Exception as e:
        return f"AI服务暂时无法使用，请稍后再试。错误信息: {str(e)}"


def summarize_review(event_data: dict) -> str:
    """
    生成活动复盘摘要
    
    Args:
        event_data: 活动数据字典
        
    Returns:
        AI生成的复盘摘要
    """
    prompt = f"""
请根据以下活动数据生成一份复盘摘要：
活动名称：{event_data.get('name', '')}
预算：{event_data.get('budget', 0)}
实际支出：{event_data.get('actual_spend', 0)}
获得商机数：{event_data.get('leads', 0)}
类型：{event_data.get('type', '')}

请输出三个部分：
1. 核心成果
2. 存在不足  
3. 后续优化建议

请用专业、简洁、有建设性的中文回答。
"""
    
    return get_marketing_insight(prompt)
