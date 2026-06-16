import re

with open('main.py', 'r') as f:
    content = f.read()

# Find the /chat endpoint and add vision handling
vision_code = '''
    # Check if this is a vision request (has image)
    is_vision = False
    image_base64 = None
    
    # Try to extract image from message if it contains base64
    if hasattr(request, 'image') and request.image:
        is_vision = True
        image_base64 = request.image
        logger.info(f"Processing vision request with image")
    
    # Also check if message contains [Image: data:image/
    if not is_vision and request.message and '[Image: data:image/' in request.message:
        is_vision = True
        import re
        match = re.search(r'data:image/[^;]+;base64,([A-Za-z0-9+/=]+)', request.message)
        if match:
            image_base64 = match.group(1)
            logger.info(f"Extracted image from message")
    
    # For vision requests, use the vision format
    if is_vision and image_base64:
        model = "meta/llama-4-maverick-17b-128e-instruct"
        content = [
            {"type": "text", "text": request.message.replace('[Image: data:image/jpeg;base64,XXX]', '').strip() or "What's in this image?"},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}}
        ]
        messages = [{"role": "user", "content": content}]
        logger.info(f"Using vision format with model: {model}")
    else:
        messages = [{"role": "user", "content": request.message}]
'''

# Insert vision handling after system_prompt
pattern = r'(# 1\. Memory recall.*?logger\.info\(f"Routing chat request to model: {model}"\))'
replacement = r'\1\n    ' + vision_code.replace('\n', '\n    ')

# Check if vision code already exists
if 'is_vision' not in content:
    content = content.replace(
        'logger.info(f"Routing chat request to model: {model}")',
        vision_code + '\n    logger.info(f"Routing chat request to model: {model}")'
    )
    with open('main.py', 'w') as f:
        f.write(content)
    print("✅ Vision support added to main.py")
else:
    print("Vision support already exists")
