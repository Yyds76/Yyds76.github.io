-- Roblox Lua Script Example
-- How to use the API to fetch files from your repository

local HttpService = game:GetService("HttpService")

-- Configuration
local API_KEY = "yyds_steve_76"
local BASE_URL = "https://www.hbhub.dpdns.org"  -- Your proxy domain

-- Function to fetch file content from repository
local function fetchFile(fileName)
    local url = BASE_URL .. "/api/file?key=" .. API_KEY .. "&file=" .. fileName
    
    local success, response = pcall(function()
        return HttpService:GetAsync(url)
    end)
    
    if success then
        return response
    else
        warn("Failed to fetch file: " .. fileName)
        return nil
    end
end

-- Function to execute Lua code from repository
local function executeFromRepo(fileName)
    local fileContent = fetchFile(fileName)
    
    if fileContent then
        local success, result = pcall(function()
            return loadstring(fileContent)()
        end)
        
        if success then
            print("Successfully executed: " .. fileName)
            return result
        else
            warn("Error executing " .. fileName .. ": " .. tostring(result))
        end
    end
end

-- Example usage:

-- 1. Fetch and execute test.lua
print("Fetching test.lua...")
executeFromRepo("test.lua")

-- 2. Fetch content from a file in subfolder
print("Fetching scripts/example.lua...")
executeFromRepo("scripts/example.lua")

-- 3. Fetch raw content without executing
local configContent = fetchFile("config.json")
if configContent then
    print("Config content:", configContent)
end

-- 4. Alternative method using direct HTTP request
local function fetchFileDirect(fileName)
    local url = BASE_URL .. "/raw/" .. fileName .. "?api=" .. API_KEY
    
    local success, response = pcall(function()
        return HttpService:GetAsync(url)
    end)
    
    if success then
        return response
    else
        warn("Failed to fetch file directly: " .. fileName)
        return nil
    end
end

-- Example of direct fetch
local directContent = fetchFileDirect("test.lua")
if directContent then
    print("Direct fetch successful!")
    -- Execute the fetched code
    loadstring(directContent)()
end
