#---Variables---#

#region Variables

$jsonFileName = "interviews.json"

#endregion


#---Functions---#

#region Functions

Function GetJsonFilePath
{
    $path = $PSScriptRoot

    $currentDir = Get-Item -Path $path

    $parent = $currentDir.parent;

    $interviews = Join-Path -Path $parent.FullName -ChildPath "interviews"

    $jsonPath = Join-Path -Path $interviews -ChildPath $jsonFileName

    $exists = Test-Path -Path $jsonPath

    if (!$exists)
    {
        New-Item -Path $jsonPath -ItemType File
    }
    
    return $jsonPath
}

Function ParseAndValidateJson($filePath)
{
    [hashtable]$Return = @{} 
    $Return.Success = 0
    $Return.Data = {}
    $Return.ErrorReason = ""

    $fileContents = Get-Content -Path $filePath | Out-String

    #if ($fileContents -eq $null)
    if ($null -eq $fileContents)
    {
        $ErrorReason = "Interviews is empty"
        Write-Host $ErrorReason

        $Return.Success = $false
        $Return.Data = $null
        $Return.ErrorReason = $ErrorReason
        return $Return
    }

    try
    {
        $jsonContent = ConvertFrom-Json -InputObject $fileContents

        Write-Host "Json is valid"
        $Return.Success = $true
        $Return.Data = $jsonContent
        return $Return
    }
    catch
    {
        Write-Host $_
        $ErrorReason = "Json is not valid"
        Write-Host $ErrorReason

        $Return.Success = $false
        $Return.Data = $null
        $Return.ErrorReason = $ErrorReason
        return $Return
    }

    return $Return
}

Function InputInterview
{
    Write-Host "--Add Interview Record--"

    Write-Host "Please Enter The Employee's First Name"
    $inputFirstName = Read-Host

    Write-Host "Please Enter The Employee's Last Name"
    $inputLastName = Read-Host

    Write-Host "Please Enter The Employee's Role"
    $inputRole = Read-Host

    Write-Host "Please Enter A Short Description Of The Employee"
    $inputShortDescription = Read-Host

    Write-Host "Please Enter The GitHub Interview Url"
    Write-Host -ForegroundColor DarkYellow "aka https://github.com/Protirus/OneMinuteWith/blob/master/interviews/ProtirusEmployee.md"
    $inputInterviewUrl = Read-Host
    $inputFileName = Split-Path $inputInterviewUrl -Leaf

    Write-Host "Please Enter The Formal Employee Picture Url"
    Write-Host -ForegroundColor DarkYellow "aka https://avatars2.githubusercontent.com/u/33064621?s=460&v=4"
    $inputFormalImageUrl = Read-Host
    
    Write-Host "Please Enter The Informal (Fun) Employee Picture Url"
    Write-Host -ForegroundColor DarkYellow "aka https://avatars2.githubusercontent.com/u/33064621?s=460&v=4"
    $inputInformalImageUrl = Read-Host

    Write-Host "Please Enter The Date Of The Interview (dd/MM/yyyy)"
    $inputInterviewDate = Read-Host

    $inputInterview = New-Object -TypeName psobject

    $inputName = New-Object -TypeName psobject
    $inputName | Add-Member -MemberType NoteProperty -Name firstName -Value $inputFirstName
    $inputName | Add-Member -MemberType NoteProperty -Name lastName -Value $inputLastName
    $inputName | Add-Member -MemberType NoteProperty -Name fullName -Value "$inputFirstName $inputLastName"

    $inputInterview | Add-Member -MemberType NoteProperty -Name employeeName -Value $inputName
    #$inputInterview | Add-Member -MemberType NoteProperty -Name employeeName -Value "$inputFirstName $inputLastName"
    $inputInterview | Add-Member -MemberType NoteProperty -Name employeeRole -Value $inputRole
    $inputInterview | Add-Member -MemberType NoteProperty -Name shortDescription -Value $inputShortDescription
    $inputInterview | Add-Member -MemberType NoteProperty -Name interviewUrl -Value $inputInterviewUrl
    $inputInterview | Add-Member -MemberType NoteProperty -Name fileName -Value $inputFileName
    $inputInterview | Add-Member -MemberType NoteProperty -Name formalImageUrl -Value $inputFormalImageUrl
    $inputInterview | Add-Member -MemberType NoteProperty -Name informalImageUrl -Value $inputInformalImageUrl
    $inputInterview | Add-Member -MemberType NoteProperty -Name interviewDate -Value $inputInterviewDate

    Write-Host "New One Minute With interview record:"
    Write-Host ($inputInterview | Format-List | Out-String)

    [hashtable]$Return = @{} 
    $Return.Save = $false
    $Return.Interview = {}

    $saveInterview = {

        $addRecord = Read-Host -Prompt "Would you like to add this interview record to One Minute View? (Y/N)"

        If ($addRecord.ToLower() -eq "y")
        {
            Write-Host "Saving interview"

            $Return.Save = $true
            $Return.Interview = $inputInterview
            return $Return
        }
        Elseif ($addRecord.ToLower() -eq "n")
        {
            Write-Host "Not saving interview"
            $Return.Save = $false
            $Return.Interview = $null
            return $Return
        }
        Else
        {
            Write-Host "Please answer Y or N!" -BackgroundColor Red
            &$saveInterview 
        }
    }

    &$saveInterview
}

Function SaveToFile($filePath, [array]$data)
{
    $jsonString = ConvertTo-Json @($interviews) | Out-String

    Out-File -FilePath $filePath -InputObject $jsonString
}

#endregion

#--Implementation--#

#region Implementation

Clear-Host

$interviewJsonPath = GetJsonFilePath

$parseResult = ParseAndValidateJson($interviewJsonPath)

[PsObject[]]$interviews = @()

if ($parseResult.Success -eq $true)
{
    #add interview to array

    [array]$interviews = $parseResult.Data
}

$interview = InputInterview

if ($interview.Save)
{
    $interviews += $interview.Interview

    SaveToFile $interviewJsonPath $interviews

    Write-Host -ForegroundColor Green "Updated $interviewJsonPath"
}
else
{
    Write-Host -ForegroundColor Yellow "No changes have been made to $interviewJsonPath"
}

#endregion