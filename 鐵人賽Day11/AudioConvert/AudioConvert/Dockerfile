#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

#¦w¸ËFFmpeg
RUN apt-get update && apt-get install -y ffmpeg

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["AudioConvert.csproj", "./"]
RUN dotnet restore "./AudioConvert.csproj"
COPY . .
WORKDIR "/src/"
RUN dotnet build "AudioConvert.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "AudioConvert.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "AudioConvert.dll"]
